import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ problemId: string }> } 
) {
  try {
    const { problemId } =await params;

    const problem = await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
      include: {
        examples: true,
        test_cases: true,
        
      }
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(problem);

  } catch (error: any) {
    console.error("Failed to fetch problem:", error);

    return NextResponse.json(
      {
        message: "An error occurred while fetching the problem",
        error: error.message,
      },
      { status: 500 }
    );
  }
}