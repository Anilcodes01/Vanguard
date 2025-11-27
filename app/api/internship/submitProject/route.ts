import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { fetchGithubRepo } from "@/app/lib/github-loader";
import { generateCodeReview } from "@/app/lib/gemini-reviewer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      description,
      githubLink,
      liveLink,
      projectId,
      overview,
      screenshots = [],
    } = body;

    if (!githubLink || !liveLink || !projectId) {
      return NextResponse.json(
        { message: "GitHub link, Live link, and Project ID are required" },
        { status: 400 }
      );
    }

    await prisma.internshipProject.update({
      where: { id: projectId },
      data: {
        isCompleted: true,
        title: title,
        description: description || "",
        githubLink: githubLink,
        liveLink: liveLink,
        overview: overview || "",
        screenshots: screenshots,
        aiReviewStatus: "PROCESSING",
      },
    });

    const codeContext = await fetchGithubRepo(githubLink);

    const reviewData = await generateCodeReview(
      title,
      description || "Internship Project",
      overview,
      codeContext
    );

    const reviewAvailableAt = new Date(Date.now() + 30 * 60 * 1000);

    const submitProject = await prisma.internshipProject.update({
      where: {
        id: projectId,
      },
      data: {
        aiReviewStatus: reviewData ? "COMPLETED" : "FAILED",
        aiScore: reviewData?.score ?? null,
        aiFeedback: reviewData?.summary ?? null,
        aiImprovements: reviewData?.improvements ?? [],
        reviewAvailableAt: reviewAvailableAt,
      },
    });

    return NextResponse.json(
      {
        message: "Project submitted successfully. Review will be available in 30 minutes.",
        project: submitProject,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}