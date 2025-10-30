import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase =await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { projectId } = await req.json();

  if (!projectId) {
    return NextResponse.json(
      { message: "Project ID is required." },
      { status: 400 }
    );
  }

  try {
    const existingProgress = await prisma.projectProgress.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json(
        { message: "Project already started." },
        { status: 409 } 
      );
    }

    const newProgress = await prisma.projectProgress.create({
      data: {
        userId: user.id,
        projectId: projectId,
      },
    });

    return NextResponse.json(
      {
        message: "Project started successfully!",
        progress: newProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to start project:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}