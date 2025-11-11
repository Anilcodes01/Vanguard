import { prisma } from '@/lib/prisma';
import { createClient } from '@/app/utils/supabase/server';
import { cache } from 'react';

export const getDiscussionProjects = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const projects = await prisma.submittedProjects.findMany({
    orderBy: {
      upvotes: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      name: true,
      short_description: true,
      coverImage: true,
      builtWith: true,
      description: true,
      githubUrl: true,
      liveUrl: true,
      createdAt: true,
      screenshots: true,
      user: {
        select: {
          profiles: true,
        },
      },
      project: true,
      _count: {
        select: {
          upvotes: true,
          comments: true,
          bookmarks: true,
        },
      },
      upvotes: userId ? { where: { userId } } : false,
      bookmarks: userId ? { where: { userId } } : false,
    },
  });

  return projects.map(p => {
    const { _count, upvotes, bookmarks, ...rest } = p;
    return {
      ...rest,
      createdAt: p.createdAt.toISOString(),
      upvotesCount: _count.upvotes,
      commentsCount: _count.comments,
      bookmarksCount: _count.bookmarks,
      hasUpvoted: !!upvotes?.length,
      hasBookmarked: !!bookmarks?.length,
      comments: [],
    };
  });
});