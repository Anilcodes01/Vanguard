"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchDashboardData } from "@/app/store/features/dashboard/dashboardSlice";
import { fetchProjects } from "@/app/store/features/projects/projectSlice";
import FullProjectCardSkeleton from "./Projects/ProjectCardSkeleton";
import LeaderboardWidget from "./LeaderWidget";
import {  Lock } from "lucide-react";
import ProjectCard from "./Projects/ProjectsCard";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";
import { DailyProblemCard , AllProblemsSolvedCard} from "./DailyProblemsCard";


export default function UserLoggedInLanding() {
  const dispatch: AppDispatch = useDispatch();

  const { profile } = useSelector((state: RootState) => state.profile);
  const {
    dailyProblem,
    status: dashboardStatus,
    error: dashboardError,
  } = useSelector((state: RootState) => state.dashboard);

  const {
    projects,
    status: projectsStatus,
    error: projectsError,
  } = useSelector((state: RootState) => state.projects);

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
    if (projectsStatus === "idle") {
      dispatch(fetchProjects());
    }
    if (leaderboardStatus === "idle") {
      dispatch(fetchLeaderboard());
    }
  }, [dashboardStatus, projectsStatus, leaderboardStatus, dispatch]);

  const isPageLoading =
    dashboardStatus === "loading" ||
    dashboardStatus === "idle" ||
    projectsStatus === "loading" ||
    projectsStatus === "idle";

  const combinedError = dashboardError || projectsError || leaderboardError;

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
    <div className="min-h-screen bg-[#262626] text-white p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-start w-full mb-12">
          <h1 className="text-4xl font-bold">
            Welcome, {profile?.name || "Coder"} 👋
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                {dailyProblem ? (
                  <DailyProblemCard problem={dailyProblem} />
                ) : (
                  <AllProblemsSolvedCard />
                )}
              </div>

              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="relative group rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Lock className="w-10 h-10 text-neutral-400 mb-2" />
                      <p className="font-bold text-white text-lg">Coming Soon</p>
                    </div>

                    <div className="pointer-events-none">
                      <ProjectCard project={project} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 text-center">
                  <p className="text-neutral-400">
                    No projects found right now. Check back later!
                  </p>
                </div>
              )}
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