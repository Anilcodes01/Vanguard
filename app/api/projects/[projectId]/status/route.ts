import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type ProjectStatusResponse = {
  status: "NotStarted" | "InProgress" | "Submitted";
  startedAt?: string; 
};

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const supabase =await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ProjectStatusResponse>({ status: "NotStarted" });
  }

  const { projectId } = params;

  try {
    const submission = await prisma.submittedProjects.findFirst({
      where: { userId: user.id, projectId: projectId },
    });

    if (submission) {
      return NextResponse.json<ProjectStatusResponse>({ status: "Submitted" });
    }

    const progress = await prisma.projectProgress.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId,
        },
      },
    });

    if (progress) {
      return NextResponse.json<ProjectStatusResponse>({
        status: "InProgress",
        startedAt: progress.startedAt.toISOString(),
      });
    }

    return NextResponse.json<ProjectStatusResponse>({ status: "NotStarted" });
  } catch (error) {
    console.error("Failed to get project status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}