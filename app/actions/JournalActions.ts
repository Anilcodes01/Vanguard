"use server";

import { prisma } from "@/lib/prisma";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCommunityJournals() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
            profiles: {
              select: {
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    return journals;
  } catch (error) {
    console.error("Error fetching community journals:", error);
    return [];
  }
}

export async function createJournalPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const content = formData.get("content") as string;

  if (!content || content.trim().length === 0) {
    return { error: "Content cannot be empty" };
  }

  try {
    await prisma.journal.create({
      data: {
        userId: user.id,
        content: content,

        title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
      },
    });

    revalidatePath("/journal");
    return { success: true };
  } catch (error) {
    console.error("Error creating journal:", error);
    return { error: "Failed to post journal" };
  }
}
