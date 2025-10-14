import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server"; 
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ problemId: string }> } 
) {
  try {
    const { problemId } =await params; 

    const supabase =await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        examples: true,
        testCases: true,
      },
    });

    if (!problem) {
      return NextResponse.json({ message: "Problem not found" }, { status: 404 });
    }

    let solutionStatus = null;
    if (user) {
      const solution = await prisma.problemSolution.findUnique({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId: problemId,
          },
        },
        select: {
          status: true,
        },
      });
      if (solution) {
        solutionStatus = solution.status;
      }
    }

    const responseData = {
      ...problem,
      solutionStatus, 
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Failed to fetch problem:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "An error occurred while fetching the problem", error: errorMessage },
      { status: 500 }
    );
  }
}