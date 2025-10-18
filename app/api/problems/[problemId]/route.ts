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
    const {problemId} =await params;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        examples: true,
        testCases: true, 
        problemLanguageDetails: {
          orderBy: {
            languageId: 'desc', 
          }
        }, 
      },
    });

    if (!problem) {
      return NextResponse.json({ message: "Problem not found" }, { status: 404 });
    }

    let solutionStatus = null;
    if (user) {
        const solution = await prisma.problemSolution.findUnique({
            where: { userId_problemId: { userId: user.id, problemId } },
            select: { status: true },
        });
        if (solution) {
            solutionStatus = solution.status;
        }
    }
    
    return NextResponse.json({ ...problem, solutionStatus });

  } catch (error) {
    console.error("Failed to fetch problem:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}