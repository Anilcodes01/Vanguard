"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProblemCard from "@/app/components/Problems/ProblemCard";
import { fetchMoreProblems } from "@/app/(public)/problems/action";
import { Difficulty } from "@prisma/client";

type Problem = Awaited<ReturnType<typeof fetchMoreProblems>>[0];
type FilterType = "All" | "Easy" | "Medium" | "Hard";

const difficultyFilters: FilterType[] = ["All", "Easy", "Medium", "Hard"];

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

  // 1. Initialize with props
  const [problems, setProblems] = useState(initialProblems);
  const [page, setPage] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // 2. Determine active filter from URL
  const paramDifficulty = searchParams.get("difficulty");
  
  // Ensure case-insensitive matching for the UI filter button
  const activeFilter = (
    difficultyFilters.find(f => f.toLowerCase() === paramDifficulty?.toLowerCase()) || "All"
  ) as FilterType;

  const hasMore = problems.length < initialTotalCount;

  // 3. Reset state when initialProblems changes (e.g. user switched tabs)
  useEffect(() => {
    setProblems(initialProblems);
    setPage(2);
    setIsFiltering(false);
    // Force scroll to top when switching filters
    // window.scrollTo(0, 0); 
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

    // ❌ REMOVED THE BUG: difficultyForServer = activeFilter.toUpperCase() as Difficulty;
    
    // ✅ FIX: Pass the value exactly as Prisma expects it (Title Case)
    if (activeFilter === "All") {
      difficultyForServer = "All";
    } else {
      // activeFilter is already "Easy", "Medium", or "Hard"
      difficultyForServer = activeFilter as Difficulty;
    }

    try {
      const newProblems = await fetchMoreProblems({
        page,
        difficulty: difficultyForServer,
      });
      
      // Safety check: Filter out any duplicates before adding to state
      setProblems((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProblems = newProblems.filter(p => !existingIds.has(p.id));
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
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {difficultyFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            disabled={isFiltering}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold transition-colors duration-200 ${
              activeFilter === filter
                ? "bg-[#f59120] text-white shadow-lg shadow-[#f59120]/10"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
            } ${isFiltering ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isFiltering ? (
        <div className="flex flex-col justify-center items-center py-12 min-h-[400px]">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#f59120] rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4 animate-pulse">
            Fetching problems...
          </p>
        </div>
      ) : (
        <>
          {problems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">
                No problems found for this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          )}

          {hasMore && !isLoadingMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMoreProblems}
                disabled={isLoadingMore}
                className="px-6 py-2 cursor-pointer bg-[#f59120] text-white font-semibold rounded-lg transition-all duration-300 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load More
              </button>
            </div>
          )}

          {isLoadingMore && (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-[#f59120] rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && problems.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-600 text-sm">
                ✨ You&apos;ve reached the end ✨
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}