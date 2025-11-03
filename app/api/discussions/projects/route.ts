import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const submittedProjects = await prisma.submittedProjects.findMany({
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
        project: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { upvotes: true },
        },
        comments: {
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const projectsWithUpvoteStatus = await Promise.all(
      submittedProjects.map(async (p) => {
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