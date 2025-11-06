import { NextResponse } from 'next/server';
import { PrismaClient, SolutionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topProblems = await prisma.problem.findMany({
      take: 3,
      orderBy: {
        solutions: {
          _count: 'desc',
        },
      },
      where: {
        solutions: {
          some: {
            status: SolutionStatus.Solved,
          },
        },
      },
      include: {
        _count: {
          select: {
            solutions: {
              where: { status: SolutionStatus.Solved },
            },
          },
        },
      },
    });

    return NextResponse.json(topProblems);
  } catch (error) {
    console.error('Failed to fetch top problems:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error', error }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}