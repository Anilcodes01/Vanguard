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

    const updatedProject = await prisma.internshipProject.update({
      where: {
        id: projectId,
      },
      data: {
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error: unknown) {
    console.error("Start Project Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
