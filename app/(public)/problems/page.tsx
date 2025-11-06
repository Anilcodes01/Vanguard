"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import ProblemCard, {ProblemCardSkeleton} from "@/app/components/Problems/ProblemCard";
import {
  fetchProblemsPage,
  resetProblemsList,
} from "@/app/store/features/problems/problemsSlice";

type FilterType = "All" | "Beginner" | "Intermediate" | "Advanced";
const difficultyFilters: FilterType[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function Problems() {
  const dispatch: AppDispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const { problems, status, error, hasMore, nextPage } = useSelector(
    (state: RootState) => state.problemsList
  );

  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchProblemsPage({ page: 1, difficulty: "All" }));
    return () => {
      dispatch(resetProblemsList());
    };
  }, [dispatch]);

  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter === activeFilter) return;
    setActiveFilter(newFilter);
    dispatch(resetProblemsList());
    dispatch(fetchProblemsPage({ page: 1, difficulty: newFilter }));
  };

  const loadMoreProblems = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchProblemsPage({ page: nextPage, difficulty: activeFilter }));
    }
  };

  return (
    <div className="bg-[#262626] min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Practice Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Sharpen your skills with our curated collection of coding challenges.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {difficultyFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold transition-colors duration-200 ${
                activeFilter === filter
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/10"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {error && nextPage === 1 ? (
          <div className="flex items-center justify-center p-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {isLoading && nextPage === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProblemCardSkeleton key={index} />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>

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
            
            {isLoading && nextPage > 1 && (
                <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-neutral-800 border-t-green-500 rounded-full animate-spin"></div>
                </div>
            )}

            {!hasMore && problems.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-neutral-500 text-sm">
                  ✨ You&apos;ve reached the end ✨
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}