import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { projectId, githubUrl, liveUrl } = await req.json();

  if (!projectId || !githubUrl) {
    return NextResponse.json(
      {
        message: "Project ID and GitHub URL are required.",
      },
      { status: 400 }
    );
  }

  try {
    const existingSubmission = await prisma.submittedProjects.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { message: "You have already submitted this project." },
        { status: 409 }
      );
    }

    const newSubmission = await prisma.submittedProjects.create({
      data: {
        projectId: projectId,
        githubUrl: githubUrl,
        liveUrl: liveUrl,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Project submitted successfully!",
        submission: newSubmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project Submission Error:", error);
    return NextResponse.json(
      {
        message:
          "An internal server error occurred while submitting the project.",
      },
      { status: 500 }
    );
  }
}
