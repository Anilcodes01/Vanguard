"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProblemCard, {
} from "@/app/components/Problems/ProblemCard";
import { fetchMoreProblems } from "@/app/(public)/problems/action";

type Problem = Awaited<ReturnType<typeof fetchMoreProblems>>[0];
type FilterType = "All" | "Beginner" | "Intermediate" | "Advanced";

const difficultyFilters: FilterType[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

interface ProblemsListProps {
  initialProblems: Problem[];
  initialTotalCount: number;
}

export default function ProblemsList({
  initialProblems,
  initialTotalCount,
}: ProblemsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [problems, setProblems] = useState(initialProblems);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const activeFilter = (searchParams.get("difficulty") as FilterType) || "All";
  const hasMore = problems.length < initialTotalCount;

  useEffect(() => {
    setProblems(initialProblems);
    setPage(2);
  }, [initialProblems]);

  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter === activeFilter) return;
    router.push(`/problems?difficulty=${newFilter}`);
  };

  const loadMoreProblems = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const newProblems = await fetchMoreProblems({
      page,
      difficulty: activeFilter,
    });
    setProblems((prev) => [...prev, ...newProblems]);
    setPage((prev) => prev + 1);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-10">
        {difficultyFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold transition-colors duration-200 ${
              activeFilter === filter
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "bg-neutral-800 text-white hover:bg-neutral-700 hover:text-neutral-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {initialProblems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-black">No problems found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMoreProblems}
            disabled={isLoading}
            className="px-6 py-2 cursor-pointer bg-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load More
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      )}

      {!hasMore && problems.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-black text-sm">
            ✨ You&apos;ve reached the end ✨
          </p>
        </div>
      )}
    </>
  );
}
