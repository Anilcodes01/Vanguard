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
import { Code, Zap, Clock, BarChart3, ArrowRight } from "lucide-react";
import ProjectCard from "./Projects/ProjectsCard";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";

const DailyProblemCard = ({ problem }: { problem: DailyProblem }) => {


  const difficultyMap: {
    [key: string]: { color: string; xp: number; label: string };
  } = {
    Beginner: {
      color: "text-green-400",
      xp: 100,
      label: "Beginner",
    },
    Intermediate: {
      color: "text-yellow-400",
      xp: 150,
      label: "Intermediate",
    },
    Advanced: {
      color: "text-red-400",
      xp: 200,
      label: "Advanced",
    },
  };

  const problemDifficulty = difficultyMap[problem.difficulty] || {
    color: "text-neutral-400",
    xp: 0,
    label: "Unknown",
  };

  return (
    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 flex flex-col justify-between h-full shadow-lg transition-all hover:border-sky-500/50">
      <div>
        <div className="mb-4">
          <p className="text-sm font-medium text-sky-400 mb-1">
            Daily Challenge
          </p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {problem.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-400 mb-5 border-t border-b border-neutral-800 py-3">
          <div className="flex items-center gap-2" title="Experience Points">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {problemDifficulty.xp} XP
            </span>
          </div>
          <div className="flex items-center gap-2" title="Difficulty">
            <BarChart3 size={16} className={problemDifficulty.color} />
            <span className={`text-sm font-semibold ${problemDifficulty.color}`}>
              {problemDifficulty.label}
            </span>
          </div>
          <div className="flex items-center gap-2" title="Maximum Time">
            <Clock size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">
              {`Max ${problem.maxTime}s`}
            </span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-3">
            Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {problem.topic.map((t, index) => (
              <span
                key={index}
                className="bg-neutral-800 text-neutral-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link href={`/problems/${problem.id}`} className="w-full mt-auto">
        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group">
          Solve Challenge
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
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