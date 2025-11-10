import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const projectWithDetails = Prisma.validator<Prisma.SubmittedProjectsDefaultArgs>()({
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
    comments: {
      include: {
        user: {
          include: {
            profiles: { select: { avatar_url: true, name: true, username: true } },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    },
  },
});

type ProjectWithDetails = Prisma.SubmittedProjectsGetPayload<typeof projectWithDetails>;
type CommentFromPrisma = ProjectWithDetails["comments"][number];
type NestedComment = CommentFromPrisma & { replies: NestedComment[] };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const submittedProjects: ProjectWithDetails[] =
      await prisma.submittedProjects.findMany(projectWithDetails);

    const projectsWithNestedComments = submittedProjects.map((project) => {
      const comments = project.comments;
      const commentMap = new Map<string, NestedComment>();
      const rootComments: NestedComment[] = [];

      comments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      comments.forEach((comment) => {
        if (comment.parentId && commentMap.has(comment.parentId)) {
          const parentComment = commentMap.get(comment.parentId);
          const childComment = commentMap.get(comment.id);
          if (parentComment && childComment) {
            parentComment.replies.push(childComment);
          }
        } else {
          const rootComment = commentMap.get(comment.id);
          if (rootComment) {
            rootComments.push(rootComment);
          }
        }
      });

      return {
        ...project,
        comments: rootComments,
        commentsCount: project._count.comments,
      };
    });

    const finalProjects = await Promise.all(
      projectsWithNestedComments.map(async (p) => {
        let hasUpvoted = false;
        let hasBookmarked = false;

        if (user) {
          const [upvote, bookmark] = await Promise.all([
            prisma.upvote.findUnique({
              where: {
                userId_submittedProjectId: {
                  userId: user.id,
                  submittedProjectId: p.id,
                },
              },
            }),
            prisma.bookmark.findUnique({
              where: {
                userId_submittedProjectId: {
                  userId: user.id,
                  submittedProjectId: p.id,
                },
              },
            }),
          ]);

          hasUpvoted = !!upvote;
          hasBookmarked = !!bookmark; 
        }

        return {
          ...p,
          upvotesCount: p._count.upvotes,
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