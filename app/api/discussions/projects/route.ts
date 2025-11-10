import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const projectForList = Prisma.validator<Prisma.SubmittedProjectsDefaultArgs>()({
  include: {
    user: {
      include: {
        profiles: { select: { avatar_url: true, name: true, username: true } },
      },
    },
    project: {
      select: { name: true },
    },
    _count: {
      select: {
        upvotes: true,
        comments: true,
        bookmarks: true,
      },
    },
  },
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const submittedProjects = await prisma.submittedProjects.findMany(projectForList);
    const finalProjects = await Promise.all(
      submittedProjects.map(async (p) => {
        let hasUpvoted = false;
        let hasBookmarked = false;

        if (user) {
          const [upvote, bookmark] = await Promise.all([
            prisma.upvote.findUnique({ where: { userId_submittedProjectId: { userId: user.id, submittedProjectId: p.id } } }),
            prisma.bookmark.findUnique({ where: { userId_submittedProjectId: { userId: user.id, submittedProjectId: p.id } } }),
          ]);
          hasUpvoted = !!upvote;
          hasBookmarked = !!bookmark;
        }
        
        return {
          ...p,
          upvotesCount: p._count.upvotes,
          commentsCount: p._count.comments,
          bookmarksCount: p._count.bookmarks,
          hasUpvoted,
          hasBookmarked,
        };
      })
    );

    finalProjects.sort((a, b) => b.upvotesCount - a.upvotesCount);

    return NextResponse.json(finalProjects);
  } catch (error) {
    console.error("Failed to fetch discussion projects:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}