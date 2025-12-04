"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProblemCard from "@/app/components/Problems/ProblemCard";
import { fetchMoreProblems } from "@/app/(public)/problems/action";
import { Difficulty } from "@prisma/client";
import { Layers } from "lucide-react";

type Problem = Awaited<ReturnType<typeof fetchMoreProblems>>[0];
type FilterType = "All" | "Easy" | "Medium" | "Hard";

const difficultyFilters: FilterType[] = ["All", "Easy", "Medium", "Hard"];

interface ProblemsListProps {
  initialProblems: Problem[];
  initialTotalCount: number;
  userDisplayName?: string;
}

export default function ProblemsList({
  initialProblems,
  initialTotalCount,
  userDisplayName = "Developer",
}: ProblemsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [problems, setProblems] = useState(initialProblems);
  const [page, setPage] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const paramDifficulty = searchParams.get("difficulty");

  const activeFilter = (difficultyFilters.find(
    (f) => f.toLowerCase() === paramDifficulty?.toLowerCase()
  ) || "All") as FilterType;

  const hasMore = problems.length < initialTotalCount;

  useEffect(() => {
    setProblems(initialProblems);
    setPage(2);
    setIsFiltering(false);
  }, [initialProblems]);

  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter === activeFilter) return;
    setIsFiltering(true);
    router.push(`/problems?difficulty=${newFilter}`);
  };

  const loadMoreProblems = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    let difficultyForServer: Difficulty | "All";
    if (activeFilter === "All") {
      difficultyForServer = "All";
    } else {
      difficultyForServer = activeFilter as Difficulty;
    }

    try {
      const newProblems = await fetchMoreProblems({
        page,
        difficulty: difficultyForServer,
      });

      setProblems((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewProblems = newProblems.filter(
          (p) => !existingIds.has(p.id)
        );
        return [...prev, ...uniqueNewProblems];
      });

      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to fetch more problems:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-8 gap-6 md:gap-0">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {userDisplayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            Coding Challenges
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {initialTotalCount} problems available to solve
          </p>
        </div>

        {}
        <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          {difficultyFilters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                disabled={isFiltering}
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-orange-500 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                  } 
                  ${
                    isFiltering
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {}
      {isFiltering ? (
        <div className="flex flex-col justify-center items-center py-20 min-h-[400px]">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-orange-400 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4 text-sm animate-pulse font-mono">
            Filtering problems...
          </p>
        </div>
      ) : (
        <>
          {problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Layers className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No problems found
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                Try selecting a different difficulty level.
              </p>
              <button
                onClick={() => handleFilterChange("All")}
                className="text-orange-500 hover:text-orange-600 font-medium hover:underline text-sm"
              >
                Clear filters &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          )}

          {hasMore && !isLoadingMore && (
            <div className="flex justify-center mt-16 pt-8 border-t border-dashed border-gray-100">
              <button
                onClick={loadMoreProblems}
                disabled={isLoadingMore}
                className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-2xl hover:border-orange-200 hover:text-orange-500 hover:shadow-md transition-all duration-300"
              >
                Load More Challenges
                <span className="group-hover:translate-y-0.5 transition-transform duration-300">
                  ↓
                </span>
              </button>
            </div>
          )}

          {isLoadingMore && (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-400 rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && problems.length > 0 && (
            <div className="text-center mt-16 pb-8">
              <p className="text-gray-300 text-xs uppercase tracking-widest font-mono">
                End of list
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
