import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import ProblemsList from "@/app/components/Problems/ProblemsList.tsx/ProblemsList";

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

async function getProblems(difficulty: Difficulty | "All", page: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const skip = (page - 1) * PAGE_SIZE;
  const whereCondition: { difficulty?: Difficulty } = {};
  if (difficulty !== "All" && VALID_DIFFICULTIES.includes(difficulty)) {
    whereCondition.difficulty = difficulty;
  }
  try {
    const [problemsData, totalCount] = await prisma.$transaction([
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
          _count: {
            select: {
              solutions: { where: { userId: user?.id, status: "Solved" } },
            },
          },
        },
        orderBy: { id: "asc" },
      }),
      prisma.problem.count({ where: whereCondition }),
    ]);
    const problems = problemsData.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      maxTime: p.maxTime,
      xp: getXpForDifficulty(p.difficulty),
      topic: p.topic,
      solved: p._count.solutions > 0,
    }));
    return { problems, totalCount };
  } catch (error) {
    console.error("Prisma query error:", error);
    return { problems: [], totalCount: 0 };
  }
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
    <div className="bg-[#ffffff] min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3 tracking-tight">
            Practice Problems
          </h1>
          <p className="text-black text-lg">
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
