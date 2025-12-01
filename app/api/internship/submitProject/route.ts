import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { fetchGithubRepo } from "@/app/lib/github-loader";
import { generateCodeReview } from "@/app/lib/gemini-reviewer";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL || undefined,
});

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
      projectId,
      title,
      shortDescription,
      tags,
      githubLink,
      liveLink,
      overview,
      screenshots = [],
    } = body;

    if (!githubLink || !liveLink || !projectId || !title) {
      return NextResponse.json(
        {
          message:
            "Project Name, GitHub link, Live link, and Project ID are required",
        },
        { status: 400 }
      );
    }

    await prisma.internshipProject.update({
      where: { id: projectId },
      data: {
        isCompleted: true,
        customTitle: title,
        shortDescription: shortDescription,
        tags: tags || [],
        overview: overview,
        githubLink,
        liveLink,
        screenshots,
        aiReviewStatus: "PROCESSING",
      },
    });

    const codeContext = await fetchGithubRepo(githubLink);
    const reviewData = await generateCodeReview(
      title,
      overview || shortDescription || "Internship Project",
      overview,
      codeContext
    );

    const reviewAvailableAt = new Date(Date.now() + 30 * 60 * 1000);

    const submitProject = await prisma.internshipProject.update({
      where: { id: projectId },
      data: {
        aiReviewStatus: reviewData ? "COMPLETED" : "FAILED",
        aiScore: reviewData?.score ?? null,
        aiFeedback: reviewData?.summary ?? null,
        aiImprovements: reviewData?.improvements ?? [],
        reviewAvailableAt: reviewAvailableAt,
      },
    });

    try {
      const delaySeconds = 30 * 60;
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send-scheduled`;

      await qstash.publishJSON({
        url: callbackUrl,
        body: {
          userId: user.id,
          title: title,
          weekNumber: body.weekNumber || 1,
        },
        headers: {
          "x-vercel-protection-bypass": process.env.VERCEL_BYPASS_SECRET!,
        },
        delay: delaySeconds,
      });
    } catch (qstashError) {
      console.error("Failed to schedule QStash notification:", qstashError);
    }

    return NextResponse.json(
      {
        message:
          "Project submitted successfully. Review will be available in 30 minutes.",
        project: submitProject,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Submit Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
