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
          _count: {
            select: { likes: true },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          replies: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

type ProjectWithDetails = Prisma.SubmittedProjectsGetPayload<
  typeof projectWithDetails
>;
type CommentFromPrisma = ProjectWithDetails["comments"][number];

type ProcessedComment = Omit<
  CommentFromPrisma,
  "_count" | "likes" | "replies"
> & {
  replies: ProcessedComment[];
  likesCount: number;
  hasLiked: boolean;
};

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
  const currentUserId = user?.id;

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

    const processComments = (
      comments: CommentFromPrisma[]
    ): ProcessedComment[] => {
      return comments.map((comment) => {
        const processedReplies = comment.replies
          ? processComments(comment.replies as CommentFromPrisma[])
          : [];

        const { _count, likes, replies, ...restOfComment } = comment;

        return {
          ...restOfComment,
          replies: processedReplies,
          likesCount: _count.likes,
          hasLiked: currentUserId
            ? likes.some((like) => like.userId === currentUserId)
            : false,
        };
      });
    };

    type NestedComment = CommentFromPrisma & { replies: NestedComment[] };
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

    const processedRootComments = processComments(rootComments);

    let hasUpvoted = false;
    let hasBookmarked = false;

    if (currentUserId) {
      const [upvote, bookmark] = await Promise.all([
        prisma.upvote.findUnique({
          where: {
            userId_submittedProjectId: {
              userId: currentUserId,
              submittedProjectId: project.id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_submittedProjectId: {
              userId: currentUserId,
              submittedProjectId: project.id,
            },
          },
        }),
      ]);
      hasUpvoted = !!upvote;
      hasBookmarked = !!bookmark;
    }

    const { comments, _count, ...restOfProject } = project;

    const finalProjectData = {
      ...restOfProject,
      comments: processedRootComments,
      upvotesCount: _count.upvotes,
      commentsCount: _count.comments,
      bookmarksCount: _count.bookmarks,
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
