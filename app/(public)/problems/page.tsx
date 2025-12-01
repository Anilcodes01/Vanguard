import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import ProblemsList from "@/app/components/Problems/ProblemsList.tsx/ProblemsList";
import { unstable_cache } from "next/cache";

const PAGE_SIZE = 12;
const VALID_DIFFICULTIES: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const getXpForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "Beginner":
      return 100;
    case "Intermediate":
      return 250;
    case "Advanced":
      return 500;
    default:
      return 0;
  }
};

const getCachedProblemData = unstable_cache(
  async (difficulty: Difficulty | "All", page: number) => {
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
            difficulty: true,
            maxTime: true,
            topic: true,
          },
          orderBy: { id: "asc" },
        }),
        prisma.problem.count({ where: whereCondition }),
      ]);

      return { problems, totalCount };
    } catch (error) {
      console.error("Prisma cached query error:", error);
      return { problems: [], totalCount: 0 };
    }
  },
  ["problems-list-data"],
  {
    revalidate: 3600,
    tags: ["problems-list"],
  }
);

async function getProblems(difficulty: Difficulty | "All", page: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { problems: rawProblems, totalCount } = await getCachedProblemData(
    difficulty,
    page
  );

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
    difficulty: p.difficulty,
    maxTime: p.maxTime,
    xp: getXpForDifficulty(p.difficulty),
    topic: p.topic,
    solved: solvedProblemIds.has(p.id),
  }));

  return { problems, totalCount };
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: Difficulty | "All" }>;
}) {
  const resolvedSearchParams = await searchParams;
  const difficulty = resolvedSearchParams.difficulty || "All";

  const initialData = await getProblems(difficulty, 1);

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tight">
            Practice Problems
          </h1>
          <p className="text-gray-600 text-lg">
            Sharpen your skills with our curated collection of coding
            challenges.
          </p>
        </div>

        <ProblemsList
          initialProblems={initialData.problems}
          initialTotalCount={initialData.totalCount}
        />
      </div>
    </div>
  );
}
