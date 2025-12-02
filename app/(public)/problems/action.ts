"use server";

import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

const PAGE_SIZE = 12;

const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const getXpForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "Easy":
      return 100;
    case "Medium":
      return 250;
    case "Hard":
      return 500;
    default:
      return 0;
  }
};

export async function fetchMoreProblems({
  page,
  difficulty,
}: {
  page: number;
  difficulty: Difficulty | "All";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const skip = (page - 1) * PAGE_SIZE;

  const whereCondition: { difficulty?: Difficulty } = {};
  if (difficulty !== "All" && VALID_DIFFICULTIES.includes(difficulty)) {
    whereCondition.difficulty = difficulty;
  }

  const problemsData = await prisma.problem.findMany({
    where: whereCondition,
    skip: skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      acceptanceRate: true,
      tags: true,
      _count: {
        select: {
          userProgress: {
            where: {
              userId: user?.id,
              status: "Solved",
            },
          },
        },
      },
    },

    orderBy: { createdAt: "desc" },
  });

  return problemsData.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    acceptanceRate: p.acceptanceRate,
    xp: getXpForDifficulty(p.difficulty),
    tags: p.tags,
    solved: p._count.userProgress > 0,
  }));
}
