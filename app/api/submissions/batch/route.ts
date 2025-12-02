import { prisma } from "@/lib/prisma";
import {
  SubmissionStatus,
  SolutionStatus,
  Difficulty,
  Prisma,
} from "@prisma/client";
import axios from "axios";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getWeekStartDateUTC } from "@/lib/dateUtils";

const LEADERBOARD_GROUP_SIZE = 30;
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1000;
const DEFAULT_CPU_TIME_LIMIT = 5;

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
};

type Judge0SubmissionResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: { id: number; description: string };
  token: string;
};

type TestCaseResult = {
  testCaseId: string;
  status: string;
};

async function assignUserToLeaderboardGroup(
  userId: string,
  tx: Prisma.TransactionClient
) {
  const userProfile = await tx.profiles.findUnique({
    where: { id: userId },
    include: { currentGroup: true },
  });

  if (!userProfile) return;

  const weekStartDate = getWeekStartDateUTC();

  if (
    userProfile.currentGroup &&
    userProfile.currentGroup.weekStartDate.getTime() === weekStartDate.getTime()
  ) {
    return;
  }

  const availableGroups = await tx.leaderboardGroup.findMany({
    where: {
      league: userProfile.league,
      weekStartDate: weekStartDate,
    },
    include: { _count: { select: { members: true } } },
  });

  const availableGroup =
    availableGroups.find((g) => g._count.members < LEADERBOARD_GROUP_SIZE) ||
    null;

  let groupIdToAssign: string;

  if (availableGroup) {
    groupIdToAssign = availableGroup.id;
  } else {
    const newGroup = await tx.leaderboardGroup.create({
      data: {
        league: userProfile.league,
        weekStartDate: weekStartDate,
      },
    });
    groupIdToAssign = newGroup.id;
  }

  await tx.profiles.update({
    where: { id: userId },
    data: { currentGroupId: groupIdToAssign },
  });
}

function mapJudge0StatusToEnum(description: string): SubmissionStatus {
  const mapping: { [key: string]: SubmissionStatus } = {
    Accepted: SubmissionStatus.Accepted,
    "Wrong Answer": SubmissionStatus.WrongAnswer,
    "Time Limit Exceeded": SubmissionStatus.TimeLimitExceeded,
    "Compilation Error": SubmissionStatus.CompilationError,
    "Runtime Error (NZEC)": SubmissionStatus.RuntimeError,
    "Internal Error": SubmissionStatus.InternalError,
  };
  return mapping[description] || SubmissionStatus.InternalError;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { problemId, code, startTime, language } = body;

    if (!problemId || !code || !startTime || !language) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const judge0LanguageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
    if (!judge0LanguageId) {
      return NextResponse.json(
        { message: "Unsupported language." },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return NextResponse.json(
        { message: "Problem or test cases not found." },
        { status: 404 }
      );
    }

    const template = await prisma.codingProblemStarterTemplate.findUnique({
      where: {
        problemId_language: {
          problemId: problemId,
          language: language,
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Language not enabled for this problem." },
        { status: 400 }
      );
    }

    const submissions = problem.testCases.map((testCase) => {
      let finalSourceCode = code;

      if (template.driverCode) {
        finalSourceCode = template.driverCode.replace("{{USER_CODE}}", code);

        if (testCase.input) {
          finalSourceCode = finalSourceCode.replace(
            "{{INPUT}}",
            testCase.input
          );
        }
      }

      const stdin =
        !template.driverCode && testCase.input ? testCase.input : undefined;

      return {
        language_id: judge0LanguageId,
        source_code: Buffer.from(finalSourceCode).toString("base64"),
        stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
        expected_output: testCase.expectedOutput
          ? Buffer.from(testCase.expectedOutput).toString("base64")
          : null,
        cpu_time_limit: DEFAULT_CPU_TIME_LIMIT,
      };
    });

    const judgeBaseUrl = process.env.JUDGE0_API_URL;

    const judgeResponse = await axios.post(
      `${judgeBaseUrl}/submissions/batch`,
      { submissions },
      {
        params: { base64_encoded: "true", wait: "true", fields: "*" },
        headers: { "Content-Type": "application/json" },
      }
    );

    let results: Judge0SubmissionResult[] = judgeResponse.data;

    if (Array.isArray(results) && results.length > 0 && !results[0].status) {
      const tokens = results
        .map((r: Judge0SubmissionResult) => r.token)
        .join(",");

      let attempts = 0;
      let isComplete = false;

      while (attempts < MAX_POLL_ATTEMPTS && !isComplete) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        const pollResponse = await axios.get(
          `${judgeBaseUrl}/submissions/batch`,
          {
            params: {
              tokens: tokens,
              base64_encoded: "true",
              fields: "*",
            },
            headers: { "Content-Type": "application/json" },
          }
        );

        const pollData = pollResponse.data;
        if (pollData && pollData.submissions) {
          results = pollData.submissions;
        } else {
          results = pollData;
        }

        const allFinished = results.every(
          (r: Judge0SubmissionResult) =>
            r.status && r.status.id !== 1 && r.status.id !== 2
        );

        if (allFinished) {
          isComplete = true;
        }
      }
    }

    if (
      !Array.isArray(results) ||
      results.length !== problem.testCases.length
    ) {
      throw new Error("Invalid response from execution engine.");
    }

    let allTestsPassed = true;
    let maxExecutionTime = 0;
    let maxMemory = 0;

    let firstFailedResult: Judge0SubmissionResult | null = null;
    let firstFailedIndex = -1;

    const testCaseResults: TestCaseResult[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const testCase = problem.testCases[i];

      if (!result || !result.status) {
        testCaseResults.push({
          testCaseId: testCase.id.toString(),
          status: "Internal Error",
        });
        allTestsPassed = false;
        continue;
      }

      result.stdout = result.stdout
        ? Buffer.from(result.stdout, "base64").toString("utf-8")
        : null;
      result.stderr = result.stderr
        ? Buffer.from(result.stderr, "base64").toString("utf-8")
        : null;
      result.compile_output = result.compile_output
        ? Buffer.from(result.compile_output, "base64").toString("utf-8")
        : null;

      const time = parseFloat(result.time) || 0;
      const memory = result.memory || 0;
      if (time > maxExecutionTime) maxExecutionTime = time;
      if (memory > maxMemory) maxMemory = memory;

      const isAccepted = result.status.id === 3;

      if (!isAccepted && allTestsPassed) {
        allTestsPassed = false;
        firstFailedResult = result;
        firstFailedIndex = i;
      }

      testCaseResults.push({
        testCaseId: testCase.id.toString(),
        status: result.status.description || "Unknown",
      });
    }

    const finalStatusDescription = allTestsPassed
      ? "Accepted"
      : firstFailedResult?.status?.description || "Internal Error";

    let xpEarned = 0;
    let starsEarned = 0;
    let isFirstSolve = false;

    const existingSolution = await prisma.problemSolution.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    });
    const previouslySolved =
      existingSolution && existingSolution.status === SolutionStatus.Solved;

    if (allTestsPassed && !previouslySolved) {
      isFirstSolve = true;

      switch (problem.difficulty) {
        case Difficulty.Easy:
          xpEarned = 100;
          break;
        case Difficulty.Medium:
          xpEarned = 250;
          break;
        case Difficulty.Hard:
          xpEarned = 500;
          break;
      }

      const solveTime = Date.now();
      const solveDuration = (solveTime - startTime) / 1000;
      const benchmark = 1200;
      if (solveDuration <= benchmark / 2) starsEarned = 3;
      else if (solveDuration <= benchmark) starsEarned = 2;
      else starsEarned = 1;
    }

    await prisma.$transaction(async (tx) => {
      await assignUserToLeaderboardGroup(user.id, tx);

      const newSubmission = await tx.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          code: code,
          language: language,
          status: mapJudge0StatusToEnum(finalStatusDescription),
          executionTime: maxExecutionTime,
          executionMemory: maxMemory,
        },
      });

      await tx.problemSolution.upsert({
        where: { userId_problemId: { userId: user.id, problemId: problem.id } },
        create: {
          userId: user.id,
          problemId: problem.id,
          status: allTestsPassed
            ? SolutionStatus.Solved
            : SolutionStatus.Attempted,
          firstAttemptedAt: new Date(),
          lastAttemptedAt: new Date(),
          firstSolvedAt: allTestsPassed ? new Date() : null,
          bestSubmissionId: allTestsPassed ? newSubmission.id : null,
          starsEarned: starsEarned,
          xpEarned: xpEarned,
        },
        update: {
          lastAttemptedAt: new Date(),
          ...(isFirstSolve && {
            status: SolutionStatus.Solved,
            firstSolvedAt: new Date(),
            bestSubmissionId: newSubmission.id,
            starsEarned: starsEarned,
            xpEarned: xpEarned,
          }),
        },
      });

      if (xpEarned > 0 || starsEarned > 0) {
        await tx.profiles.update({
          where: { id: user.id },
          data: {
            xp: { increment: xpEarned },
            stars: { increment: starsEarned },
          },
        });
      }
    });

    if (allTestsPassed) {
      return NextResponse.json({
        status: "Accepted",
        xpEarned: isFirstSolve ? xpEarned : 0,
        starsEarned: isFirstSolve ? starsEarned : 0,
        executionTime: maxExecutionTime,
        executionMemory: maxMemory,
        testCaseResults,
      });
    } else {
      const failedCaseData =
        firstFailedIndex !== -1 ? problem.testCases[firstFailedIndex] : null;
      return NextResponse.json({
        status: firstFailedResult?.status?.description || "Error",
        input: failedCaseData?.input,
        userOutput: firstFailedResult?.stdout,
        message:
          firstFailedResult?.compile_output ||
          firstFailedResult?.stderr ||
          firstFailedResult?.message,
        expectedOutput: failedCaseData?.expectedOutput,
        executionTime: maxExecutionTime,
        executionMemory: maxMemory,
        testCaseResults,
      });
    }
  } catch (error) {
    console.error("Submission failed:", error);
    let errorMessage = "An unknown error occurred.";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage, status: "Error" },
      { status: 500 }
    );
  }
}
