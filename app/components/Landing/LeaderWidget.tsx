"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
    {[...Array(7)].map((_, i) => (
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

export default function LeaderboardWidget() {
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

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
          <Trophy className="text-neutral-700 mb-2" size={32} />
          <h3 className="text-md font-bold text-neutral-200">Join a League!</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      );
    }

    const displayedLeaderboard = leaderboard.slice(0, 10);

    return (
      <div className="space-y-2">
        {displayedLeaderboard.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            rank={index + 1}
            isCurrentUser={entry.id === currentUserId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-neutral-900/70 p-6 rounded-lg h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-3">
          <Trophy className="text-yellow-400" size={24} />
          {league ? `${league} League` : "Weekly Leaderboard"}
        </h2>
        <p className="text-sm text-neutral-500">Top 10 this week</p>
      </div>

      <div className="flex-grow overflow-y-auto">{renderContent()}</div>

      {!isLoading && !error && (
        <div className="mt-4 text-center">
          <Link
            href="/leaderboard"
            className="text-sky-400 hover:text-sky-300 transition-colors text-sm font-semibold"
          >
            View Full Leaderboard →
          </Link>
        </div>
      )}
    </div>
  );
}
