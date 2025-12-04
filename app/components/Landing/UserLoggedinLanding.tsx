"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchDashboard } from "@/app/store/features/dashboard/dashboardSlice";
import FullProjectCardSkeleton from "./Projects/ProjectCardSkeleton";
import { DailyProblemCard, AllProblemsSolvedCard } from "./DailyProblemsCard";
import InProgressProjectCard from "./Projects/InProgressProjectCard";
import { Calendar, FolderOpen, Target, Sparkles } from "lucide-react";
import Link from "next/link";

export default function UserLoggedInLanding() {
  const dispatch: AppDispatch = useDispatch();

  const {
    profile,
    dailyProblem,
    inProgressProjects,
    dashboardStatus,
    dashboardError,
  } = useSelector((state: RootState) => ({
    profile: state.profile.profile,
    dailyProblem: state.dashboard.dailyProblem,
    inProgressProjects: state.dashboard.inProgressProjects,
    dashboardStatus: state.dashboard.status,
    dashboardError: state.dashboard.error,
  }));

  useEffect(() => {
    if (dashboardStatus === "idle") {
      dispatch(fetchDashboard());
    }
  }, [dashboardStatus, dispatch]);

  const isPageLoading =
    dashboardStatus === "loading" || dashboardStatus === "idle";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (isPageLoading) {
    return <FullProjectCardSkeleton />;
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
        <p className="text-red-500 font-medium">Unable to load dashboard</p>
        <p className="text-gray-400 text-sm mt-1">{dashboardError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-white">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-8 gap-6 md:gap-0">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Overview
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
            Welcome back, {profile?.name || "Coder"}{" "}
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Here is your daily activity summary.
          </p>
        </div>

        {}
        <div className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider leading-none mb-1">
              Today
            </span>
            <span className="text-sm font-semibold text-gray-900 leading-none">
              {today}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="space-y-16">
        {}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Daily Challenge
            </h2>
          </div>

          <div className="w-full">
            {dailyProblem ? (
              <DailyProblemCard problem={dailyProblem} />
            ) : (
              <AllProblemsSolvedCard />
            )}
          </div>
        </section>

        {}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">In Progress</h2>
          </div>

          {inProgressProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {inProgressProjects.map((project) => (
                <InProgressProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Sparkles className="w-10 h-10 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No active projects
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Ready to build something new?
              </p>
              <Link
                href="/projects"
                className="text-orange-500 hover:text-orange-600 font-medium hover:underline text-sm transition-all"
              >
                Start a Project &rarr;
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
