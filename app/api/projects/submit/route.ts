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

  const {name,  projectId, githubUrl, liveUrl, description, builtWith } =
    await req.json();

  if (
    !projectId ||
    !githubUrl ||
    !builtWith ||
    !Array.isArray(builtWith) ||
    builtWith.length === 0
  ) {
    return NextResponse.json(
      {
        message: "Project ID, GitHub URL, and technologies used are required.",
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
        name: name,
        githubUrl: githubUrl,
        liveUrl: liveUrl,
        description: description,
        builtWith: builtWith,
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

export async function GET() {
  try {
    const submissions = await prisma.submittedProjects.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("Fetch Submitted Projects Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        message: "An error occurred while fetching the submitted projects",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}