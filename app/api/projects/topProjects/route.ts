import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topProjects = await prisma.project.findMany({
      take: 3,
      orderBy: {
        SubmittedProjects: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            SubmittedProjects: true,
          },
        },
      },
    });

    return NextResponse.json(topProjects);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}