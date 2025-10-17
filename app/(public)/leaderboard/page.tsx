"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { RootState, AppDispatch } from "@/app/store/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";
import { LeaderboardEntry } from "@/app/store/features/leaderboard/leaderboardSlice";

const PROMOTION_ZONE = 10;
const DEMOTION_ZONE = 5;

const LoadingSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-3">
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
      className={`flex items-center gap-3 py-3 border-b border-neutral-800 transition-colors ${
        isCurrentUser ? "text-sky-400" : "text-neutral-300 hover:text-white"
      }`}
    >
      <div className="w-4 flex items-center justify-center">
        {showIcon && zone === "promotion" && (
          <ArrowUp size={16} className="text-green-500" />
        )}
        {showIcon && zone === "demotion" && (
          <ArrowDown size={16} className="text-red-500" />
        )}
      </div>
      <span className="text-sm font-medium text-neutral-500 w-8">
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
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover"
      />
      <p className="flex-1 text-sm font-medium truncate">
        {entry.name || "Anonymous"}
      </p>
      <p className="text-sm font-semibold tabular-nums">{entry.weeklyXP}</p>
    </div>
  );
};

export default function LeaderboardPage() {
  const dispatch: AppDispatch = useDispatch();

  const {
    leaderboard,
    error,
    currentUserId,
    status,
    league
  } = useSelector((state: RootState) => state.leaderboard)

  const isLoading = status === 'loading' || status === 'idle'

  useEffect(() => {
    if(status === 'idle') {
      dispatch(fetchLeaderboard()) 
    }
  }, [status, dispatch])

  if (isLoading) {
    return (
      <div className="bg-[#262626] text-white min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-neutral-800 rounded mb-2"></div>
            <div className="h-4 w-64 bg-neutral-800 rounded"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#262626] text-center p-4">
        <Trophy className="text-neutral-700 mb-4" size={40} />
        <h2 className="text-lg font-semibold text-neutral-300 mb-2">Join a League</h2>
        <p className="text-sm text-neutral-500 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#262626] text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 pb-6 border-b border-neutral-800">
          <h1 className="text-2xl font-semibold text-white mb-1">
            {league} League
          </h1>
          <p className="text-sm text-neutral-500">
            Resets every Sunday
          </p>
        </div>

        <div>
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 1}
                isCurrentUser={entry.id === currentUserId}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500">Leaderboard is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}