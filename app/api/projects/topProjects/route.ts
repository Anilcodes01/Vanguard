import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { SubmittedProjects: true },
        },
        SubmittedProjects: {
          include: {
            user: {
              select: {
                profiles: {
                  select: {
                    name: true,
                    avatar_url: true,
                  },
                },
              },
            },
            _count: {
              select: {
                upvotes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    const projectsWithUpvoteCount = projects.map(project => {
      const totalUpvotes = project.SubmittedProjects.reduce(
        (acc, submission) => acc + submission._count.upvotes,
        0
      );
      return { ...project, totalUpvotes };
    });

    const topProjects = projectsWithUpvoteCount
      .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
      .slice(0, 3);

    return NextResponse.json(topProjects);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}