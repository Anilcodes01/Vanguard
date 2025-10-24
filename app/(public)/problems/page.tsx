"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import Link from "next/link";
import {
  fetchProblemsPage,
  resetProblemsList,
} from "@/app/store/features/problems/problemsSlice";

export default function Problems() {
  const dispatch: AppDispatch = useDispatch();

  const { problems, status, error, hasMore, nextPage } = useSelector(
    (state: RootState) => state.problemsList
  );

  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchProblemsPage(1));

    return () => {
      dispatch(resetProblemsList());
    };
  }, [dispatch]);

  const loadMoreProblems = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchProblemsPage(nextPage));
    }
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-emerald-400 bg-emerald-400/10";
      case "Intermediate":
        return "text-amber-400 bg-amber-400/10";
      case "Advanced":
        return "text-rose-400 bg-rose-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="bg-[#262626] min-h-screen">
      <div className="w-full max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Practice Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Sharpen your skills with curated coding challenges
          </p>
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
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <div className="divide-y divide-neutral-800">
                {problems.map((problem, index) => (
                  <Link
                    key={problem.id}
                    href={`/problems/${problem.id}`}
                    className="grid grid-cols-12 items-center gap-4 p-4 transition-colors hover:bg-neutral-800/50 group"
                  >
                    <div className="col-span-1 text-center text-neutral-500 text-sm">
                      {index + 1}
                    </div>

                    <div className="col-span-8 md:col-span-9 flex items-center gap-2">
                      <h3 className="text-neutral-200 font-medium truncate group-hover:text-sky-400 transition-colors">
                        {problem.title}
                      </h3>
                      {problem.solved && (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-400 flex-shrink-0"
                          aria-label="Solved"
                          role="img"
                        />
                      )}
                    </div>

                    <div className="col-span-3 md:col-span-2 flex justify-end">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getDifficultyStyles(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {isLoading && nextPage === 1 && (
              <div className="flex justify-center items-center py-16">
                <div className="w-10 h-10 border-4 border-neutral-800 border-t-neutral-400 rounded-full animate-spin"></div>
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreProblems}
                  disabled={isLoading}
                  className="px-6 py-2 bg-neutral-800 text-neutral-300 font-semibold rounded-lg transition-all duration-300 hover:bg-neutral-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {!hasMore && problems.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-neutral-500 text-sm">
                  ✨ You&apos;ve reached the end ✨
                </p>
              </div>
            )}

            {error && nextPage > 1 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-sm">
                  <span>⚠️</span>
                  <span>Failed to load more problems. Please try again.</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
