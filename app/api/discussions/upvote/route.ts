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

  const { submittedProjectId } = await req.json();

  if (!submittedProjectId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_submittedProjectId: {
          userId: user.id,
          submittedProjectId,
        },
      },
    });

    if (existingUpvote) {
      await prisma.upvote.delete({
        where: {
          userId_submittedProjectId: {
            userId: user.id,
            submittedProjectId,
          },
        },
      });
      return NextResponse.json({ message: "Upvote removed", status: "removed" });
    } else {
      await prisma.upvote.create({
        data: {
          userId: user.id,
          submittedProjectId,
        },
      });
      return NextResponse.json({ message: "Project upvoted", status: "created" });
    }
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}