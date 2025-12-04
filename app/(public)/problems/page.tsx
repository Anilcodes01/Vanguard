import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import ProblemsList from "@/app/components/Problems/ProblemsList.tsx/ProblemsList";
import { getRawProblemData, getXpForDifficulty } from "@/app/utils/problems";

export const dynamic = "force-dynamic";

const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "Developer";
  if (user) {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    displayName = profile?.name || user.user_metadata?.full_name || "Developer";
  }

  const resolvedSearchParams = await searchParams;
  const difficultyInput = resolvedSearchParams.difficulty || "All";

  const matchedDifficulty = VALID_DIFFICULTIES.find(
    (d) => d.toLowerCase() === difficultyInput.toLowerCase()
  );

  const difficulty: Difficulty | "All" = matchedDifficulty || "All";
  const initialData = await getProblems(difficulty, 1);

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      <ProblemsList
        initialProblems={initialData.problems}
        initialTotalCount={initialData.totalCount}
        userDisplayName={displayName}
      />
    </div>
  );
}
