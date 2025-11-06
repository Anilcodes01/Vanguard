"use client";

import { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { hydrateDashboard } from "@/app/store/features/dashboard/dashboardSlice";
import { hydrateInProgressProjects } from "@/app/store/features/projects/inProgressSlice";
import { hydrateLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";
import LeaderboardWidget from "./LeaderWidget";
import { DailyProblemCard, AllProblemsSolvedCard } from "./DailyProblemsCard";
import InProgressProjectCard from "./Projects/InProgressProjectCard";
import { DailyProblem, InProgressProject, LeaderboardEntry } from '@/types';

interface UserLoggedInLandingProps {
  initialDashboardData: { dailyProblem: DailyProblem | null };
  initialInProgressProjects: InProgressProject[];
  initialLeaderboardData: {
    leaderboard: LeaderboardEntry[];
    league: string | null;
    currentUserId: string | null;
  };
}

export default function UserLoggedInLanding({
  initialDashboardData,
  initialInProgressProjects,
  initialLeaderboardData,
}: UserLoggedInLandingProps) {
  const dispatch: AppDispatch = useDispatch();

  useLayoutEffect(() => {
    if (initialDashboardData) {
      dispatch(hydrateDashboard(initialDashboardData));
    }
    if (initialInProgressProjects) {
      dispatch(hydrateInProgressProjects(initialInProgressProjects));
    }
    if (initialLeaderboardData) {
      dispatch(hydrateLeaderboard(initialLeaderboardData));
    }
  }, [dispatch, initialDashboardData, initialInProgressProjects, initialLeaderboardData]);

  const { profile } = useSelector((state: RootState) => state.profile);
  const { dailyProblem } = useSelector((state: RootState) => state.dashboard);
  const { projects: inProgressProjects } = useSelector((state: RootState) => state.inProgressProjects);
  const { leaderboard, league, currentUserId, status: leaderboardStatus } = useSelector((state: RootState) => state.leaderboard);

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
              isLoading={leaderboardStatus === "loading"}
              error={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}