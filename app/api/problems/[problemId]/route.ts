import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ problemId: string } >} 
) {
  try {
    const { problemId } =await params;

    const problem = await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
      include: {
        examples: true,
      }
    });

    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(problem);

  } catch (error) {
    console.error("Failed to fetch problem:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        message: "An error occurred while fetching the problem",
        error: errorMessage, 
      },
      { status: 500 }
    );
  }
}