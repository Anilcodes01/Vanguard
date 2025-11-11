"use server";

import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const projectWithDetails =
  Prisma.validator<Prisma.SubmittedProjectsDefaultArgs>()({
    include: {
      user: {
        include: {
          profiles: true,
        },
      },
      project: true,
      _count: { select: { upvotes: true, comments: true, bookmarks: true } },
      comments: {
        include: {
          user: {
            include: {
              profiles: true,
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
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

type ProjectWithDetails = Prisma.SubmittedProjectsGetPayload<
  typeof projectWithDetails
>;
type CommentFromPrisma = ProjectWithDetails["comments"][number];

type CommentForTree = CommentFromPrisma & { replies: CommentForTree[] };

type ProcessedComment = Omit<
  CommentFromPrisma,
  "_count" | "likes" | "replies" | "createdAt"
> & {
  replies: ProcessedComment[];
  likesCount: number;
  hasLiked: boolean;
  createdAt: string;
};

export async function getProjectDetails(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  try {
    const project = await prisma.submittedProjects.findUnique({
      where: { id: projectId },
      ...projectWithDetails,
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    const processComments = (
      comments: CommentForTree[]
    ): ProcessedComment[] => {
      return comments.map((comment) => {
        const { _count, likes, createdAt, replies, ...restOfComment } = comment;
        return {
          ...restOfComment,
          createdAt: createdAt.toISOString(),
          likesCount: _count.likes,
          hasLiked: currentUserId
            ? likes.some((like) => like.userId === currentUserId)
            : false,
          replies: processComments(replies || []),
        };
      });
    };

    const commentMap = new Map<string, CommentForTree>();
    project.comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    const rootComments: CommentForTree[] = [];
    project.comments.forEach((comment) => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentMap.get(comment.id)!);
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
          where: { userId_submittedProjectId: { userId: currentUserId, submittedProjectId: project.id } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_submittedProjectId: { userId: currentUserId, submittedProjectId: project.id } },
        }),
      ]);
      hasUpvoted = !!upvote;
      hasBookmarked = !!bookmark;
    }

    const { _count, createdAt, ...restOfProject } = project;

    const finalProjectData = {
      ...restOfProject,
      createdAt: createdAt.toISOString(),
      comments: processedRootComments,
      upvotesCount: _count.upvotes,
      commentsCount: _count.comments,
      bookmarksCount: _count.bookmarks,
      hasUpvoted,
      hasBookmarked,
    };

    return finalProjectData;
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    throw new Error(
      "An internal server error occurred while fetching project details."
    );
  }
}