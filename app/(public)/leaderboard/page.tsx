"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, ArrowUp, ArrowDown, Shield } from "lucide-react";

type LeaderboardEntry = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  weeklyXP: number;
};

const PROMOTION_ZONE = 10;
const DEMOTION_ZONE = 5;

const LoadingSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-lg"
      >
        <div className="w-6 h-6 bg-neutral-700 rounded-md"></div>
        <div className="w-10 h-10 bg-neutral-700 rounded-full"></div>
        <div className="flex-1 h-6 bg-neutral-700 rounded-md"></div>
        <div className="w-16 h-6 bg-neutral-700 rounded-md"></div>
      </div>
    ))}
  </div>
);

const LeaderboardRow = ({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}) => {
  const getZone = () => {
    if (rank <= PROMOTION_ZONE) return "promotion";
    if (rank > 30 - DEMOTION_ZONE) return "demotion";
    return "safe";
  };

  const zoneStyles = {
    promotion: "border-l-4 border-green-500",
    demotion: "border-l-4 border-red-500",
    safe: "border-l-4 border-transparent",
  };

  const zoneIcons = {
    promotion: <ArrowUp size={16} className="text-green-500" />,
    demotion: <ArrowDown size={16} className="text-red-500" />,
    safe: <Shield size={16} className="text-neutral-500" />,
  };

  const zone = getZone();

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        isCurrentUser ? "bg-sky-500/10" : "hover:bg-neutral-800/50"
      } ${zoneStyles[zone]}`}
    >
      <div className="flex items-center gap-3 w-12 text-lg font-semibold text-neutral-400">
        {zoneIcons[zone]}
        <span>{rank}</span>
      </div>
      <Image
        src={
          entry.avatar_url ||
          `https://ui-avatars.com/api/?name=${
            entry.name || "A"
          }&background=262626&color=fff`
        }
        alt={entry.name || "User"}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover"
      />
      <p className="flex-1 font-medium text-neutral-200 truncate">
        {entry.name || "Anonymous User"}
      </p>
      <p className="font-bold text-lg text-white">{entry.weeklyXP} XP</p>
    </div>
  );
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [league, setLeague] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch leaderboard");
        }

        if (data.data === null) {
          setError(data.message);
        } else {
          setLeaderboard(data.leaderboard);
          setLeague(data.league);
          setCurrentUserId(data.currentUserId);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#262626] text-white min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-48 bg-neutral-700 rounded-md mb-2"></div>
            <div className="h-6 w-64 bg-neutral-700 rounded-md"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#262626] text-center p-4">
        <Trophy className="text-neutral-700 mb-4" size={48} />
        <h2 className="text-xl font-bold text-neutral-200">Join a League!</h2>
        <p className="text-neutral-500 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#262626] text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
            <Trophy className="text-yellow-400" />
            {league} League
          </h1>
          <p className="text-neutral-500">
            The competition resets every Sunday. Good luck!
          </p>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              isCurrentUser={entry.id === currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}