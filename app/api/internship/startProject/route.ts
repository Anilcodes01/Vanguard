import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectToUpdate = await prisma.internshipProject.findFirst({
      where: {
        id: projectId,
        internshipWeek: {
          userId: user.id,
        },
      },
      include: {
        internshipWeek: {
          include: {
            problems: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!projectToUpdate) {
      return NextResponse.json(
        { error: "Project not found or you don't have access" },
        { status: 404 }
      );
    }

    if (projectToUpdate.startedAt) {
      return NextResponse.json({
        message: "Project already started",
        project: projectToUpdate,
      });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.internshipProject.update({
        where: { id: projectId },
        data: { startedAt: now },
      });

      const problems = projectToUpdate.internshipWeek.problems;

      const problemUpdates = problems.map((problem, index) => {
        const unlockDate = new Date(now);
        unlockDate.setDate(now.getDate() + index);

        return tx.internshipProblem.update({
          where: { id: problem.id },
          data: { unlockAt: unlockDate },
        });
      });

      await Promise.all(problemUpdates);

      return updatedProject;
    });

    return NextResponse.json({ success: true, project: result });
  } catch (error: unknown) {
    console.error("Start Project Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
