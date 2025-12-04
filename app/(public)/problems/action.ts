"use server";

import { getRawProblemData, getXpForDifficulty } from "@/app/utils/problems";
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

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

  const { problems: rawProblems } = await getRawProblemData(difficulty, page);

  let solvedProblemIds = new Set<string>();

  if (user && rawProblems.length > 0) {
    const problemIds = rawProblems.map((p) => p.id);

    const userSolutions = await prisma.problemSolution.findMany({
      where: {
        userId: user.id,
        problemId: { in: problemIds },
        status: "Solved",
      },
      select: {
        problemId: true,
      },
    });

    solvedProblemIds = new Set(userSolutions.map((s) => s.problemId));
  }

  const problems = rawProblems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    acceptanceRate: p.acceptanceRate,
    xp: getXpForDifficulty(p.difficulty),
    tags: p.tags,
    solved: solvedProblemIds.has(p.id),
  }));

  return problems;
}
