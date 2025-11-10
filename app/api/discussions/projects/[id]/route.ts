import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const projectWithDetails =
  Prisma.validator<Prisma.SubmittedProjectsDefaultArgs>()({
    include: {
      user: {
        include: {
          profiles: {
            select: { avatar_url: true, name: true, username: true },
          },
        },
      },
      project: { select: { name: true } },
      _count: { select: { upvotes: true, comments: true, bookmarks: true } },
      comments: {
        include: {
          user: {
            include: {
              profiles: {
                select: { avatar_url: true, name: true, username: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

type ProjectWithDetails = Prisma.SubmittedProjectsGetPayload<
  typeof projectWithDetails
>;
type CommentFromPrisma = ProjectWithDetails["comments"][number];
type NestedComment = CommentFromPrisma & { replies: NestedComment[] };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!projectId) {
    return NextResponse.json(
      { message: "Project ID is required." },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.submittedProjects.findUnique({
      where: { id: projectId },
      ...projectWithDetails,
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }

    const commentMap = new Map<string, NestedComment>();
    const rootComments: NestedComment[] = [];
    project.comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    project.comments.forEach((comment) => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap
          .get(comment.parentId)!
          .replies.push(commentMap.get(comment.id)!);
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    let hasUpvoted = false;
    let hasBookmarked = false;

    if (user) {
      const [upvote, bookmark] = await Promise.all([
        prisma.upvote.findUnique({
          where: {
            userId_submittedProjectId: {
              userId: user.id,
              submittedProjectId: project.id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_submittedProjectId: {
              userId: user.id,
              submittedProjectId: project.id,
            },
          },
        }),
      ]);
      hasUpvoted = !!upvote;
      hasBookmarked = !!bookmark;
    }

    const finalProjectData = {
      ...project,
      comments: rootComments,
      upvotesCount: project._count.upvotes,
      commentsCount: project._count.comments,
      bookmarksCount: project._count.bookmarks,
      hasUpvoted,
      hasBookmarked,
    };

    return NextResponse.json(finalProjectData);
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
