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
import { getWeekStartDateUTC } from '@/lib/dateUtils';

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

    const { problemId, code, startTime } = await request.json();

    if (!problemId || !code || !startTime) {
      return NextResponse.json(
        { message: "Problem ID, code, and startTime are required." },
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

    let finalResult: Judge0Submission | null = null;
    let allTestsPassed = true;
    let firstFailedTestCase = null;

    for (const testCase of problem.testCases) {
      let source_code = code;
      let stdin: string | undefined = undefined;

      if (problem.testStrategy === "DRIVER_CODE") {
        if (!problem.driverCodeTemplate)
          throw new Error(
            `Problem ${problemId} is misconfigured: missing driver code template.`
          );
        source_code = problem.driverCodeTemplate
          .replace("{{USER_CODE}}", code)
          .replace("{{TEST_INPUT}}", testCase.input || "");
      } else {
        source_code = code;
        stdin = testCase.input || undefined;
      }

      const options = {
        method: "POST",
        url: `${process.env.JUDGE0_API_URL}/submissions`,
        params: { base64_encoded: "false", wait: "true", fields: "*" },
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
        },
        data: {
          language_id: problem.languageId,
          source_code,
          stdin,
          expected_output: testCase.expected,
        },
      };

      const judgeResponse = await axios.request(options);
      const result: Judge0Submission = judgeResponse.data;
      finalResult = result;
      if (result.status.id !== 3) {
        allTestsPassed = false;
        firstFailedTestCase = testCase;
        break;
      }
    }

    if (!finalResult) {
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
          languageId: problem.languageId,
          status: mapJudge0StatusToEnum(finalResult.status.description),
          executionTime: parseFloat(finalResult.time) || null,
          executionMemory: finalResult.memory || null,
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

    const executionTime = parseFloat(finalResult.time) || 0;
    const executionMemory = finalResult.memory || 0;

    if (allTestsPassed) {
      return NextResponse.json({
        status: "Accepted",
        xpEarned: isFirstSolve ? xpEarned : 0,
        starsEarned: isFirstSolve ? starsEarned : 0,
        executionTime,
        executionMemory,
      });
    } else {
      return NextResponse.json({
        status: finalResult.status.description,
        input: firstFailedTestCase?.input,
        userOutput: finalResult.stdout,
        expectedOutput: firstFailedTestCase?.expected,
        executionTime,
        executionMemory,
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
