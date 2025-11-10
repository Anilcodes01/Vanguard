import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  try {
    const body = await request.json();
    const { submittedProjectId } = body;

    if (!submittedProjectId) {
      return NextResponse.json(
        { error: "submittedProjectId is required" },
        { status: 400 }
      );
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_submittedProjectId: {
          userId: user.id,
          submittedProjectId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          userId_submittedProjectId: {
            userId: user.id,
            submittedProjectId,
          },
        },
      });
      return NextResponse.json(
        { message: "Bookmark removed successfully" },
        { status: 200 }
      );
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          submittedProjectId,
        },
      });
      return NextResponse.json(
        { message: "Bookmark added successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
