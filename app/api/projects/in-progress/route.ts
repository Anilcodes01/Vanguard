import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const startedProjectsProgress = await prisma.projectProgress.findMany({
      where: {
        userId: user.id,
      },
      include: {
        project: true,
      },
    });

    const submittedProjects = await prisma.submittedProjects.findMany({
      where: {
        userId: user.id,
      },
      select: {
        projectId: true,
      },
    });

    const submittedProjectIds = new Set(
      submittedProjects.map((p) => p.projectId)
    );

    const inProgressProjects = startedProjectsProgress
      .filter((progress) => !submittedProjectIds.has(progress.projectId))
      .map((progress) => ({
        ...progress.project,
        startedAt: progress.startedAt.toISOString(),
      }));

    return NextResponse.json({ projects: inProgressProjects });
  } catch (error) {
    console.error("Failed to fetch in-progress projects:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
