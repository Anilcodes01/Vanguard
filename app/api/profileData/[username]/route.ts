import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } =await params; 

    if (!username) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    const profile = await prisma.profiles.findUnique({
      where: {
        username: username,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    const [submissions, problemSolutions] = await Promise.all([
      prisma.submission.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: 'desc' },
        include: {
          problem: {
            select: { title: true },
          },
        },
      }),
      prisma.problemSolution.findMany({
        where: { userId: profile.id }, 
      }),
    ]);

    const userData = {
      profiles: [profile], 
      submissions,
      problemSolutions,
    };

    return NextResponse.json(
      {
        message: "User data fetched successfully",
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch failed:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}



