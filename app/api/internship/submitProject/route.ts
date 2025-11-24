// Your existing code is fine; minor tweak for clarity
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
      screenshots = [], // Default empty array
    } = body;

    if (!githubLink || !liveLink || !projectId) {
      return NextResponse.json(
        { message: "GitHub link, Live link, and Project ID are required" },
        { status: 400 }
      );
    }

    // Optional: Validate screenshots are valid URLs
    if (!Array.isArray(screenshots) || screenshots.some(url => !url.startsWith('https://'))) {
      return NextResponse.json({ message: "Invalid screenshots" }, { status: 400 });
    }

    const submitProject = await prisma.internshipProject.update({
      where: {
        id: projectId,
      },
      data: {
        isCompleted: true,
        title: title,
        description: description || '', // Add if needed
        githubLink: githubLink,
        liveLink: liveLink,
        overview: overview || "",
        screenshots: screenshots,
      },
    });

    return NextResponse.json(
      {
        message: "Project submitted successfully",
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