"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/utils/supabase/server";

export async function getCommunityJournals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const journals = await prisma.journal.findMany({
      where: {
        userId: { not: user?.id },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        createdAt: true,
        user: {
          select: {
            profiles: {
              select: {
                name: true,
                username: true,
                avatar_url: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const formattedJournals = journals.map((j) => {
      const profile = j.user?.profiles[0] || {};
      return {
        id: j.id,
        title: j.title,
        description: j.description,
        tags: j.tags,
        createdAt: j.createdAt,
        author: {
          name: profile.name || "Anonymous",
          username: profile.username || "user",
          avatar_url: profile.avatar_url,
        },
      };
    });

    return formattedJournals;
  } catch (error) {
    console.error("Error fetching community journals:", error);
    return [];
  }
}
