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

// Constants
const LEADERBOARD_GROUP_SIZE = 30;
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1000;
const DEFAULT_CPU_TIME_LIMIT = 5; // Seconds (since maxTime was removed from DB)

// Map string languages to Judge0 IDs
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python: 71,     // Python 3
  java: 62,       // OpenJDK 13
  cpp: 54,        // GCC 9
  c: 50,          // GCC 9
  go: 60,
  // Add others as needed
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

// --- Leaderboard Logic ---
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

  // If already assigned to this week's group, return
  if (
    userProfile.currentGroup &&
    userProfile.currentGroup.weekStartDate.getTime() === weekStartDate.getTime()
  ) {
    return;
  }

  // Find available group
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
    // Changed: 'language' (string) instead of 'languageId'
    const { problemId, code, startTime, language } = body;

    if (!problemId || !code || !startTime || !language) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Resolve Judge0 ID
    const judge0LanguageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
    if (!judge0LanguageId) {
      return NextResponse.json(
        { message: "Unsupported language." },
        { status: 400 }
      );
    }

    // Fetch Problem & Test Cases
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { 
        testCases: {
          orderBy: { order: 'asc' } // Ensure deterministic order
        } 
      },
    });

    if (!problem || !problem.testCases || problem.testCases.length === 0) {
      return NextResponse.json(
        { message: "Problem or test cases not found." },
        { status: 404 }
      );
    }

    // Verify Language is enabled for this problem
    const starterTemplate = await prisma.codingProblemStarterTemplate.findUnique({
        where: {
            problemId_language: {
                problemId,
                language
            }
        }
    });

    if (!starterTemplate) {
        return NextResponse.json(
            { message: "Language not enabled for this problem." },
            { status: 400 }
        );
    }

    // Prepare Submissions for Judge0 Batch
    const submissions = problem.testCases.map((testCase) => {
      // Standard Execution Strategy (STDIN -> STDOUT)
      const source_code = code;
      const stdin = testCase.input || undefined;

      return {
        language_id: judge0LanguageId,
        source_code: Buffer.from(source_code).toString("base64"),
        stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
        // Update: 'expected' changed to 'expectedOutput'
        expected_output: testCase.expectedOutput
          ? Buffer.from(testCase.expectedOutput).toString("base64")
          : null,
        cpu_time_limit: DEFAULT_CPU_TIME_LIMIT, 
      };
    });

    const judgeBaseUrl = process.env.JUDGE0_API_URL;
    
    // --- Send Batch to Judge0 ---
    const judgeResponse = await axios.post(
      `${judgeBaseUrl}/submissions/batch`,
      { submissions },
      {
        params: { base64_encoded: "true", wait: "true", fields: "*" },
        headers: { "Content-Type": "application/json" },
      }
    );

    let results: Judge0SubmissionResult[] = judgeResponse.data;

    // --- Polling Logic (if wait=true didn't finish) ---
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

    if (!Array.isArray(results) || results.length !== problem.testCases.length) {
      throw new Error("Invalid response from execution engine.");
    }

    // --- Process Results ---
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

      // Decode base64 fields
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

      const isAccepted = result.status.id === 3; // 3 = Accepted in Judge0

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

    // --- Calculate Rewards ---
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
      // Updated Enums
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

      // Stars Logic (Defaulting to simple logic since maxTime removed)
      const solveTime = Date.now();
      const solveDuration = (solveTime - startTime) / 1000;
      // Assume 20 mins (1200s) is standard for now
      const benchmarkTime = 1200; 
      
      if (solveDuration <= benchmarkTime / 2) starsEarned = 3;
      else if (solveDuration <= benchmarkTime) starsEarned = 2;
      else starsEarned = 1;
    }

    // --- Database Transaction ---
    await prisma.$transaction(async (tx) => {
      await assignUserToLeaderboardGroup(user.id, tx);

      const newSubmission = await tx.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          code: code,
          language: language, // Using String now
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

    // --- Return Response ---
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
        expectedOutput: failedCaseData?.expectedOutput, // Updated field
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