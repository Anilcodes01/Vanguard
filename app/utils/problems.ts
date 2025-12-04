import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

const PAGE_SIZE = 12;
const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const getXpForDifficulty = (difficulty: Difficulty): number => {
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

export const getRawProblemData = async (
  difficulty: Difficulty | "All",
  page: number
) => {
  const skip = (page - 1) * PAGE_SIZE;
  const whereCondition: { difficulty?: Difficulty } = {};

  if (difficulty !== "All" && VALID_DIFFICULTIES.includes(difficulty)) {
    whereCondition.difficulty = difficulty;
  }

  try {
    const [problems, totalCount] = await prisma.$transaction([
      prisma.problem.findMany({
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
        },

        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
      prisma.problem.count({ where: whereCondition }),
    ]);

    return { problems, totalCount };
  } catch (error) {
    console.error("Prisma query error:", error);
    return { problems: [], totalCount: 0 };
  }
};
