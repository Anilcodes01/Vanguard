

"use server";

import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

const PAGE_SIZE = 12;
const VALID_DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

const getXpForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "Beginner": return 100;
    case "Intermediate": return 250;
    case "Advanced": return 500;
    default: return 0;
  }
};

export async function fetchMoreProblems({ page, difficulty }: { page: number; difficulty: Difficulty | "All" }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      difficulty: true,
      maxTime: true,
      topic: true,
      _count: {
        select: { solutions: { where: { userId: user?.id, status: "Solved" } } },
      },
    },
    orderBy: { id: "asc" },
  });

  return problemsData.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    maxTime: p.maxTime,
    xp: getXpForDifficulty(p.difficulty),
    topic: p.topic,
    solved: p._count.solutions > 0,
  }));
}