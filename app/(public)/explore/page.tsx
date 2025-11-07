"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchExploreData } from "@/app/store/features/explore/exploreSlice";
import ProjectCard from "@/app/components/explore/ProjectCard";
import ProblemCard from "@/app/components/explore/ProblemCard";
import { LoadingSpinner } from "@/app/components/Profile/ProfilePanel";

export default function ExplorePage() {
  const dispatch: AppDispatch = useDispatch();
  const { topProjects, topProblems, status, error } = useSelector(
    (state: RootState) => state.explore
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchExploreData());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#262626]">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#262626]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262626] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-100 md:text-5xl">
            Explore Community Highlights
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Discover the most popular projects and challenging problems tackled
            by our community.
          </p>
        </div>

        <>
          <section id="top-projects" className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-200 sm:text-left">
              Most Popular Projects
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          <section id="top-problems">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-200 sm:text-left">
              Most Solved Problems
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </section>
        </>
      </div>
    </div>
  );
}
