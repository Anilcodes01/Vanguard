import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } =await params; 

    if (!userId) {
      return NextResponse.json(
        { message: "No userId found" },
        { status: 400 }
      );
    }

    const userData = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        submissions: true,
        problemSolutions: true,
        profiles: {
          select: {
            name: true,
            college_name: true,
            avatar_url: true,
            username: true,
            domain: true,
          },
        },
      },
    });

    if (!userData) {
        return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
        )
    }

    return NextResponse.json(
      {
        message: "User data fetched successfully",
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("fetch failed:", error);
    let errorMessage =
      "An unknown error occurred during fetching the profile details.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}