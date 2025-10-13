"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";

type LeaderboardEntry = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  weeklyXP: number;
};

const PROMOTION_ZONE = 10;
const DEMOTION_ZONE = 5;

const LoadingSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2">
        <div className="w-4 h-4 bg-neutral-800 rounded"></div>
        <div className="w-8 h-8 bg-neutral-800 rounded-full"></div>
        <div className="flex-1 h-4 bg-neutral-800 rounded"></div>
        <div className="w-12 h-4 bg-neutral-800 rounded"></div>
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

  const zone = getZone();
  const showIcon = zone !== "safe";

  return (
    <div
      className={`flex items-center gap-3 py-2 transition-colors ${
        isCurrentUser ? "text-sky-400" : "text-neutral-300 hover:text-white"
      }`}
    >
      <div className="w-4 flex items-center justify-center">
        {showIcon && zone === "promotion" && (
          <ArrowUp size={14} className="text-green-500" />
        )}
        {showIcon && zone === "demotion" && (
          <ArrowDown size={14} className="text-red-500" />
        )}
      </div>
      <span className="text-sm font-medium text-neutral-500 w-6">
        {rank}
      </span>
      <Image
        src={
          entry.avatar_url ||
          `https://ui-avatars.com/api/?name=${
            entry.name || "A"
          }&background=262626&color=fff`
        }
        alt={entry.name || "User"}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover"
      />
      <p className="flex-1 text-sm font-medium truncate">
        {entry.name || "Anonymous"}
      </p>
      <p className="text-sm font-semibold tabular-nums">{entry.weeklyXP}</p>
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
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Trophy className="text-neutral-700 mb-3" size={28} />
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      );
    }

    const displayedLeaderboard = leaderboard.slice(0, 10);

    return (
      <div className="space-y-1">
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
    <div className="bg-neutral-900 p-5 rounded-lg h-full flex flex-col">
      <div className="mb-4 pb-3 border-b border-neutral-800">
        <h2 className="text-base font-semibold text-white">
          {league ? `${league} League` : "Leaderboard"}
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto">{renderContent()}</div>

      {!isLoading && !error && (
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <Link
            href="/leaderboard"
            className="text-sky-400 hover:text-sky-300 transition-colors text-xs font-medium"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}