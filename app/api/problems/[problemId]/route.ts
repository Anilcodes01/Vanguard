import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { problemId } = await params;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: { orderBy: { order: "asc" } },
        starterTemplates: { select: { id: true, language: true, code: true } },
        hints: {
          orderBy: { order: "asc" },
          select: { id: true, text: true, order: true },
        },
      },
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 }
      );
    }

    // --- NEW LOGIC START: Find Next Problem ID ---
    const nextProblem = await prisma.problem.findFirst({
      where: {
        createdAt: { gt: problem.createdAt }, // Find problems created AFTER this one
        isLocked: false, // Ensure we don't skip to a locked problem
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    // --- NEW LOGIC END ---

    const testCases = problem.testCases;
    let solutionStatus = null;

    if (user) {
      const solution = await prisma.problemSolution.findUnique({
        where: { userId_problemId: { userId: user.id, problemId } },
        select: { status: true },
      });
      if (solution) solutionStatus = solution.status;
    }

    return NextResponse.json({
      ...problem,
      testCases: testCases,
      solutionStatus,
      nextProblemId: nextProblem?.id || null, // Send this to frontend
    });
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
