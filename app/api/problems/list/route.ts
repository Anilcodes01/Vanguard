

import {prisma} from '@/lib/prisma'; 
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (page < 1) {
    return NextResponse.json({ error: 'Page must be a positive number.' }, { status: 400 });
  }
  
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const [problems, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
        skip: skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
        orderBy: {
          id: 'asc', 
        },
      }),
      prisma.problem.count(),
    ]);

    return NextResponse.json({
      problems,
      totalCount,
    });

  } catch (error: any) {
    console.error('Prisma query error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from the database.' }, { status: 500 });
  }
}