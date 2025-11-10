import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { commentId } = await request.json();

  if (!commentId) {
    return new NextResponse(JSON.stringify({ error: 'Comment ID is required' }), { status: 400 });
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId,
          },
        },
      });
      return NextResponse.json({ message: 'Comment unliked successfully.', action: 'unliked' });
    } else {
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId,
        },
      });
      return NextResponse.json({ message: 'Comment liked successfully.', action: 'liked' });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to toggle like' }), { status: 500 });
  }
}