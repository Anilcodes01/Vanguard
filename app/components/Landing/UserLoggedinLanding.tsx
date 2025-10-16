"use client";

import { useState, useEffect } from "react";
import ProjectCard from "./Projects/ProjectsCard";
import FullProjectCardSkeleton from "./Projects/ProjectCardSkeleton";
import LeaderboardWidget from "./LeaderWidget";
import { DailyProblem, LeaderboardData, LeaderboardMember } from "@/types";
import Link from "next/link";
import { Code, Zap } from "lucide-react";

type UserProfile = {
  name: string | null;
  username: string | null;
  domain: string | null;
};

type Project = {
  id: string;
  name: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};


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
          <h3 className="text-sm font-semibold text-neutral-400">Daily Challenge</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${difficultyColors[problem.difficulty] || ''}`}>
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
        <h3 className="text-lg font-bold text-white mb-2">You&apos;re on Fire! 🔥</h3>
        <p className="text-neutral-400 mb-4">You&apos;ve solved all the available problems. More are coming soon!</p>
        <Link href="/problems" className="w-full">
            <button className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
                <Code size={16} />
                Browse Problems
            </button>
        </Link>
    </div>
);


export default function UserLoggedInLanding() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

   const [currentUser, setCurrentUser] = useState<LeaderboardMember | null>(null);
  const [dailyProblem, setDailyProblem] = useState<DailyProblem | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/projects/getProjects");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }
        const data = await response.json();
        setUserProfile(data.userProfile);
        setProjects(data.projects);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

   useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboardData");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch dashboard data");
        }
        const data = await response.json();

        setDailyProblem(data.dailyProblem);
        setLeaderboardData(data.leaderboard);
        const userInLeaderboard = data.leaderboard?.group?.members.find(
          (member: LeaderboardMember) => member.id === data.userId 
        );
        setCurrentUser(userInLeaderboard || null);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return <FullProjectCardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#262626] text-white">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262626] text-white p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-start w-full mb-12">
          <h1 className="text-4xl font-bold">
            Welcome, {userProfile?.name} 👋
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                {dailyProblem ? (
                    <DailyProblemCard problem={dailyProblem} />
                ) : (
                    <AllProblemsSolvedCard />
                )}
              </div>


                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-[#3b3b3b] p-8 rounded-lg text-center">
                <p className="text-gray-300">
                  No projects found for your domain right now. Check back later!
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <LeaderboardWidget
              leaderboardData={leaderboardData}
              currentUserId={currentUser?.id || null}
              isLoading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
