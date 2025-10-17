import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const solvedProblems = await prisma.problemSolution.findMany({
      where: { userId: user.id, status: "Solved" },
      select: { problemId: true },
    });
    const solvedProblemIds = solvedProblems.map((p) => p.problemId);
    const unsolvedProblemsCount = await prisma.problem.count({
      where: { id: { notIn: solvedProblemIds } },
    });

    let dailyProblem = null;
    if (unsolvedProblemsCount > 0) {
      const randomSkip = Math.floor(Math.random() * unsolvedProblemsCount);
      dailyProblem = await prisma.problem.findFirst({
        where: { id: { notIn: solvedProblemIds } },
        skip: randomSkip,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topic: true,
        },
      });
    }

    return NextResponse.json({
      dailyProblem,
    });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        message: "Error while fetching dashboard data",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}