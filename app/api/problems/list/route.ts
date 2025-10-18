import { prisma } from '@/lib/prisma'; 
import { createClient } from '@/app/utils/supabase/server'; 
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const supabase =await createClient();
  const { data: { user } } = await supabase.auth.getUser(); 

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (page < 1) {
    return NextResponse.json({ error: 'Page must be a positive number.' }, { status: 400 });
  }
  
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const [problemsData, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
        skip: skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          difficulty: true,
          _count: {
            select: {
              solutions: {
                where: {
                  userId: user?.id, 
                  status: 'Solved',
                },
              },
            },
          },
        },
        orderBy: {
          id: 'asc', 
        },
      }),
      prisma.problem.count(),
    ]);

    const problems = problemsData.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      solved: p._count.solutions > 0,
    }));

    return NextResponse.json({
      problems,
      totalCount,
    });

  } catch (error) {
    console.error('Prisma query error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from the database.' }, { status: 500 });
  }
}