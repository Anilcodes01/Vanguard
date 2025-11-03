import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string } >}
) {
  const { projectId } =await params;

  if (!projectId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const completionCount = await prisma.submittedProjects.count({
      where: {
        projectId: projectId,
      },
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let status: "NotStarted" | "InProgress" | "Submitted" = "NotStarted";
    let startedAt: string | null = null;

    if (user) {
      const submission = await prisma.submittedProjects.findFirst({
        where: { userId: user.id, projectId: projectId },
      });

      if (submission) {
        status = "Submitted";
      } else {
        const progress = await prisma.projectProgress.findUnique({
          where: {
            userId_projectId: {
              userId: user.id,
              projectId: projectId,
            },
          },
        });

        if (progress) {
          status = "InProgress";
          startedAt = progress.startedAt.toISOString();
        }
      }
    }

    return NextResponse.json({
      project,
      status,
      startedAt,
      completionCount,
    });

  } catch (error) {
    console.error("Failed to fetch project data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}