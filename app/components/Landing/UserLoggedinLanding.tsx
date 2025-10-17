"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchDashboardData } from "@/app/store/features/dashboard/dashboardSlice";
import { fetchProjects } from "@/app/store/features/projects/projectSlice";
import FullProjectCardSkeleton from "./Projects/ProjectCardSkeleton";
import LeaderboardWidget from "./LeaderWidget";
import { DailyProblem } from "@/types";
import Link from "next/link";
import { Code, Zap } from "lucide-react";
import ProjectCard from "./Projects/ProjectsCard";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";

const DailyProblemCard = ({ problem }: { problem: DailyProblem }) => {
  const difficultyColors: { [key: string]: string } = {
    Beginner: "bg-green-500/10 text-green-400",
    Intermediate: "bg-yellow-500/10 text-yellow-400",
    Advanced: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-400">
            Daily Challenge
          </h3>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              difficultyColors[problem.difficulty] || ""
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-4">{problem.title}</h2>
      </div>
      <Link href={`/problems/${problem.slug}`} className="w-full">
        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
          <Zap size={16} />
          Solve Now
        </button>
      </Link>
    </div>
  );
};

const AllProblemsSolvedCard = () => (
  <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 flex flex-col justify-center items-center text-center h-full">
    <h3 className="text-lg font-bold text-white mb-2">
      You&apos;re on Fire! 🔥
    </h3>
    <p className="text-neutral-400 mb-4">
      You&apos;ve solved all the available problems. More are coming soon!
    </p>
    <Link href="/problems" className="w-full">
      <button className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
        <Code size={16} />
        Browse Problems
      </button>
    </Link>
  </div>
);

export default function UserLoggedInLanding() {
  const dispatch: AppDispatch = useDispatch();

  const { profile } = useSelector((state: RootState) => state.profile);
  const {
    dailyProblem,
    leaderboardData,
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
  }, [dashboardStatus, dispatch]);

  

  useEffect(() => {
    if (projectsStatus === "idle") {
      dispatch(fetchProjects());
    }
  }, [projectsStatus, dispatch]);

    useEffect(() => {
    if (leaderboardStatus === "idle") {
      dispatch(fetchLeaderboard());
    }
  }, [leaderboardStatus, dispatch]);

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
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="md:col-span-2 bg-[#3b3b3b] p-8 rounded-lg text-center">
                  <p className="text-gray-300">
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
              isLoading={leaderboardStatus === 'loading' || leaderboardStatus === 'idle'}
              error={leaderboardError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
