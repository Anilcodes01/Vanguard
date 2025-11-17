"use client";

import Image from "next/image"; 
import Link from "next/link";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { LeaderboardEntry } from "@/app/store/features/leaderboard/leaderboardSlice";
import { LeagueStatusBar } from "./LeagueStatusBar";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";

const PROMOTION_ZONE = 3;
const DEMOTION_ZONE = 5;

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardEntry[];
  league: string | null;
  currentUserId: string | null;
  isLoading: boolean;
  error: string | null;
}

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
  totalMembers,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  totalMembers: number;
}) => {
  const getZone = () => {
    if (rank <= PROMOTION_ZONE) return "promotion";
    if (rank > totalMembers - DEMOTION_ZONE) return "demotion";
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
      <span className="text-sm font-medium text-neutral-500 w-6">{rank}</span>
      <Image
        src={
          entry.avatar_url ||
          `https://ui-avatars.com/api/?name=${entry.name || "A"}&background=262626&color=fff`
        }
        alt={entry.name || "User"}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover"
      />
      <p className="flex-1 text-sm font-medium truncate">{entry.name || "Anonymous"}</p>
     <p className="text-sm font-semibold tabular-nums">{entry.weeklyXP}</p>
    </div>
  );
};

export default function LeaderboardWidget({
   leaderboard,
  league,
  currentUserId,
  isLoading,
  error,
}: LeaderboardWidgetProps) {
     const displayedLeaderboard = leaderboard.slice(0, 10);

     const leagueImage = league
        ? LeaderboardImagesData.find((imgData) => imgData.name.toLowerCase() === league.toLowerCase())
        : null;


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

    if (leaderboard.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8">
                <Trophy className="text-neutral-700 mb-3" size={28} />
                <p className="text-sm text-neutral-500">Your leaderboard is being prepared. Check back soon!</p>
            </div>
        );
    }

    return (
      <div className="space-y-1">
        {displayedLeaderboard.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            rank={index + 1}
            isCurrentUser={entry.id === currentUserId}
            totalMembers={leaderboard.length}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-5 border rounded-lg h-full flex flex-col">
      <div className="mb-4 pb-3 border-b  flex items-center gap-2"> 
        {leagueImage && ( 
          <Image
            src={leagueImage.imagePath}
            alt={leagueImage.name}
            width={24} 
            height={24}
            className="w-6 h-6" 
            priority
          />
        )}
        <h2 className="text-base font-semibold text-black">
          {league ? `${league} League` : "Leaderboard"}
        </h2>
      </div>

      {!isLoading && !error && league && currentUserId && leaderboard.length > 0 && (
        <LeagueStatusBar
          league={league}
          currentUserId={currentUserId}
          leaderboard={leaderboard}
        />
      )}

      <div className="flex-grow overflow-y-auto">{renderContent()}</div>

      {!isLoading && !error && leaderboard.length > 0 && (
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