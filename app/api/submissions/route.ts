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

type Judge0Submission = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: { id: number; description: string };
};

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

type TestCaseResult = {
  testCaseId: string;
  status: string;
};

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

    const { problemId, code, startTime, languageId } = await request.json();

    if (!problemId || !code || !startTime || !languageId) {
      return NextResponse.json(
        {
          message: "Problem ID, code, startTime, and languageId are required.",
        },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return NextResponse.json(
        { message: "Problem or test cases not found." },
        { status: 404 }
      );
    }

    const languageDetail = await prisma.problemLanguageDetails.findUnique({
      where: {
        problemId_languageId: {
          problemId: problemId,
          languageId: languageId,
        },
      },
    });

    if (!languageDetail) {
      return NextResponse.json(
        { message: "The selected language is not supported for this problem." },
        { status: 400 }
      );
    }

    let allTestsPassed = true;
    let firstFailedResult: Judge0Submission | null = null;
    let firstFailedTestCaseData: {
      input: string | null;
      expected: string | null;
    } | null = null;
    let lastResult: Judge0Submission | null = null;
    const testCaseResults: TestCaseResult[] = [];

    for (const testCase of problem.testCases) {
      let source_code = code;
      let stdin: string | undefined = undefined;

      if (problem.testStrategy === "DRIVER_CODE") {
        if (!languageDetail.driverCodeTemplate) {
          throw new Error(
            `Problem ${problemId} is misconfigured for language ${languageDetail.language}: missing driver code template.`
          );
        }
        source_code = languageDetail.driverCodeTemplate
          .replace("{{USER_CODE}}", code.trim())
          .replace("{{RAW_TEST_INPUT}}", testCase.input || "");
      } else {
        source_code = code;
        stdin = testCase.input || undefined;
      }

      const submissionData = {
        language_id: languageId,
        source_code: Buffer.from(source_code).toString("base64"),
        stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
        expected_output: testCase.expected
          ? Buffer.from(testCase.expected).toString("base64")
          : null,
        compiler_options:
          languageId === 94
            ? Buffer.from("--lib es2020,dom").toString("base64")
            : undefined,
      };

      const options = {
        method: "POST",
        url: `${process.env.JUDGE0_API_URL}/submissions`,
        params: { base64_encoded: "true", wait: "true", fields: "*" },
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
        },
        data: submissionData,
      };

      const judgeResponse = await axios.request(options);
      const result: Judge0Submission = judgeResponse.data;

      result.stdout = result.stdout
        ? Buffer.from(result.stdout, "base64").toString("utf-8")
        : null;
      result.stderr = result.stderr
        ? Buffer.from(result.stderr, "base64").toString("utf-8")
        : null;
      result.compile_output = result.compile_output
        ? Buffer.from(result.compile_output, "base64").toString("utf-8")
        : null;

      lastResult = result;
      testCaseResults.push({
        testCaseId: testCase.id.toString(),
        status: result.status.description,
      });

      if (result.status.id !== 3) {
        allTestsPassed = false;
        firstFailedResult = result;
        firstFailedTestCaseData = {
          input: testCase.input,
          expected: testCase.expected,
        };
        break;
      }
    }

    if (!lastResult) {
      throw new Error("Code execution failed to produce a result.");
    }

    const existingSolution = await prisma.problemSolution.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    });

    const isFirstSolve =
      allTestsPassed &&
      (!existingSolution || existingSolution.status !== SolutionStatus.Solved);

    let xpEarned = 0;
    let starsEarned = 0;

    if (isFirstSolve) {
      switch (problem.difficulty) {
        case Difficulty.Beginner:
          xpEarned = 100;
          break;
        case Difficulty.Intermediate:
          xpEarned = 150;
          break;
        case Difficulty.Advanced:
          xpEarned = 200;
          break;
      }

      const solveTime = Date.now();
      const solveDurationInSeconds = (solveTime - startTime) / 1000;
      const maxTimeInSeconds = problem.maxTime * 60;

      if (solveDurationInSeconds <= maxTimeInSeconds / 2) {
        starsEarned = 3;
      } else if (solveDurationInSeconds <= maxTimeInSeconds) {
        starsEarned = 2;
      } else {
        starsEarned = 1;
      }
    }

    await prisma.$transaction(async (tx) => {
      await assignUserToLeaderboardGroup(user.id, tx);

      const newSubmission = await tx.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          code: code,
          languageId: languageId,
          status: mapJudge0StatusToEnum(lastResult!.status.description),
          executionTime: parseFloat(lastResult!.time) || null,
          executionMemory: lastResult!.memory || null,
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

      const profileUpdateData: {
        xp?: { increment: number };
        stars?: { increment: number };
      } = {};

      if (xpEarned > 0) {
        profileUpdateData.xp = { increment: xpEarned };
      }
      if (starsEarned > 0) {
        profileUpdateData.stars = { increment: starsEarned };
      }

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.profiles.update({
          where: { id: user.id },
          data: profileUpdateData,
        });
      }
    });

    const executionTime = parseFloat(lastResult.time) || 0;
    const executionMemory = lastResult.memory || 0;

    if (allTestsPassed) {
      return NextResponse.json({
        status: "Accepted",
        xpEarned: isFirstSolve ? xpEarned : 0,
        starsEarned: isFirstSolve ? starsEarned : 0,
        executionTime,
        executionMemory,
        testCaseResults,
      });
    } else {
      return NextResponse.json({
        status: firstFailedResult!.status.description,
        input: firstFailedTestCaseData?.input,
        userOutput: firstFailedResult!.stdout,
        expectedOutput: firstFailedTestCaseData?.expected,
        executionTime,
        executionMemory,
        testCaseResults,
      });
    }
  } catch (error) {
    console.error("Submission failed:", error);
    let errorMessage = "An unknown error occurred during submission.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Error connecting to execution engine.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage, status: "Error" },
      { status: 500 }
    );
  }
}
