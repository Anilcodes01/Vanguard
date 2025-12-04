import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import ProblemsList from "@/app/components/Problems/ProblemsList.tsx/ProblemsList";

export const dynamic = "force-dynamic";

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

const getRawProblemData = async (
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.problem.count({ where: whereCondition }),
    ]);

    return { problems, totalCount };
  } catch (error) {
    console.error("Prisma query error:", error);
    return { problems: [], totalCount: 0 };
  }
};

async function getProblems(difficulty: Difficulty | "All", page: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { problems: rawProblems, totalCount } = await getRawProblemData(
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
    slug: p.slug,
    difficulty: p.difficulty,
    acceptanceRate: p.acceptanceRate,
    xp: getXpForDifficulty(p.difficulty),
    tags: p.tags,
    solved: solvedProblemIds.has(p.id),
  }));

  return { problems, totalCount };
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  const difficultyInput = resolvedSearchParams.difficulty || "All";

  const matchedDifficulty = VALID_DIFFICULTIES.find(
    (d) => d.toLowerCase() === difficultyInput.toLowerCase()
  );

  const difficulty: Difficulty | "All" = matchedDifficulty || "All";

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
