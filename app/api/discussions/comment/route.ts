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

  const { submittedProjectId, text } = await req.json();

  if (!submittedProjectId || !text) {
    return NextResponse.json(
      { message: "Project ID and comment text are required" },
      { status: 400 }
    );
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        userId: user.id,
        submittedProjectId,
      },
      include: {
        user: {
          include: {
            profiles: {
              select: {
                avatar_url: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}