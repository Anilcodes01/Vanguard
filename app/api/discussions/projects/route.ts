import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Define the exact shape of our query for strong typing
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

// Infer the types from our query definition
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

    const projectsWithUpvoteStatus = await Promise.all(
      projectsWithNestedComments.map(async (p) => {
        let hasUpvoted = false;
        if (user) {
          const upvote = await prisma.upvote.findUnique({
            where: {
              userId_submittedProjectId: {
                userId: user.id,
                submittedProjectId: p.id,
              },
            },
          });
          hasUpvoted = !!upvote;
        }
        return {
          ...p,
          upvotesCount: p._count.upvotes,
          hasUpvoted,
        };
      })
    );

    projectsWithUpvoteStatus.sort((a, b) => b.upvotesCount - a.upvotesCount);

    return NextResponse.json(projectsWithUpvoteStatus);
  } catch (error) {
    console.error("Failed to fetch discussion projects:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}