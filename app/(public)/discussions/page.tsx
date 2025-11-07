import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProjectSubmission, Comment as CommentType } from "@/types";
import DiscussionsClientPage from "./discussionsClientPage";

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

type ProjectWithDetails = Prisma.SubmittedProjectsGetPayload<typeof projectWithDetails>;
type CommentFromPrisma = ProjectWithDetails["comments"][number];
type NestedComment = CommentFromPrisma & { replies: NestedComment[] };

async function getProjects(): Promise<ProjectSubmission[]> {
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

    return projectsWithUpvoteStatus as unknown as ProjectSubmission[];
  } catch (error) {
    console.error("Failed to fetch discussion projects:", error);
    throw new Error("An internal server error occurred.");
  }
}

export default async function DiscussionsPage() {
  const initialProjects = await getProjects();

  return <DiscussionsClientPage initialProjects={initialProjects} />;
}