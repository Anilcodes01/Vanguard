"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchDashboardData } from "@/app/store/features/dashboard/dashboardSlice";
import { fetchInProgressProjects } from "@/app/store/features/projects/inProgressSlice";
import FullProjectCardSkeleton from "./Projects/ProjectCardSkeleton";
import LeaderboardWidget from "./LeaderWidget";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";
import { DailyProblemCard, AllProblemsSolvedCard } from "./DailyProblemsCard";
import InProgressProjectCard from "./Projects/InProgressProjectCard"; 

export default function UserLoggedInLanding() {
  const dispatch: AppDispatch = useDispatch();

  const { profile } = useSelector((state: RootState) => state.profile);
  const {
    dailyProblem,
    status: dashboardStatus,
    error: dashboardError,
  } = useSelector((state: RootState) => state.dashboard);

  const {
    projects: inProgressProjects,
    status: inProgressStatus,
    error: inProgressError,
  } = useSelector((state: RootState) => state.inProgressProjects);

  const {
    leaderboard,
    league,
    currentUserId,
    status: leaderboardStatus,
    error: leaderboardError,
  } = useSelector((state: RootState) => state.leaderboard);

  useEffect(() => {
    if (dashboardStatus === "idle") {
      dispatch(fetchDashboardData());
    }
    if (inProgressStatus === "idle") {
      dispatch(fetchInProgressProjects());
    }
    if (leaderboardStatus === "idle") {
      dispatch(fetchLeaderboard());
    }
  }, [dashboardStatus, inProgressStatus, leaderboardStatus, dispatch]);

  const isPageLoading =
    dashboardStatus === "loading" ||
    dashboardStatus === "idle" ||
    inProgressStatus === "loading" ||
    inProgressStatus === "idle";

  const combinedError = dashboardError || inProgressError || leaderboardError;

  if (isPageLoading) {
    return <FullProjectCardSkeleton />;
  }

  if (combinedError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#262626] text-white">
        <p className="text-red-400">Error: {combinedError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262626] text-white lg:p-8 p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-start w-full mb-8">
          <h1 className="text-4xl font-bold">
            Welcome, {profile?.name || "Coder"} 👋
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <div>
                {dailyProblem ? (
                  <DailyProblemCard problem={dailyProblem} />
                ) : (
                  <AllProblemsSolvedCard />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 text-neutral-300">
                  Your In-Progress Projects
                </h2>
                {inProgressProjects.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressProjects.map((project) => (
                      <InProgressProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 text-center">
                    <p className="text-neutral-400">
                      You have no projects in progress. Start one from the
                      projects page!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <LeaderboardWidget
              leaderboard={leaderboard}
              league={league}
              currentUserId={currentUserId}
              isLoading={
                leaderboardStatus === "loading" || leaderboardStatus === "idle"
              }
              error={leaderboardError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}