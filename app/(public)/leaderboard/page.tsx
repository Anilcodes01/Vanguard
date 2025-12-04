"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Trophy, ArrowUp, ArrowDown, Crown, Medal } from "lucide-react";
import { RootState, AppDispatch } from "@/app/store/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchLeaderboard } from "@/app/store/features/leaderboard/leaderboardSlice";
import { LeaderboardEntry } from "@/app/store/features/leaderboard/leaderboardSlice";
import { LeagueStatusBar } from "@/app/components/Landing/LeagueStatusBar";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";

const PROMOTION_ZONE = 3;
const DEMOTION_ZONE = 5;

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
    const totalMembers = 30;
    if (rank > totalMembers - DEMOTION_ZONE) return "demotion";
    return "safe";
  };

  const zone = getZone();

  const renderRank = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-700" />;
    return <span className="font-mono text-gray-500 font-medium">{rank}</span>;
  };

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border ${
        isCurrentUser
          ? "bg-orange-50/50 border-orange-100 shadow-sm"
          : "bg-white border-transparent hover:border-gray-100 hover:shadow-sm hover:bg-gray-50/50"
      }`}
    >
      {}
      <div className="w-12 flex items-center justify-center flex-shrink-0">
        {renderRank()}
      </div>

      {}
      <div className="w-6 flex justify-center">
        {zone === "promotion" && <ArrowUp className="w-4 h-4 text-green-500" />}
        {zone === "demotion" && <ArrowDown className="w-4 h-4 text-red-500" />}
      </div>

      {}
      <div className="relative flex-shrink-0">
        <Image
          src={
            entry.avatar_url ||
            `https://ui-avatars.com/api/?name=${
              entry.name || "A"
            }&background=f3f4f6&color=6b7280`
          }
          alt={entry.name || "User"}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover border border-gray-100"
        />
        {isCurrentUser && (
          <div className="absolute -bottom-1 -right-1 bg-orange-500 w-4 h-4 rounded-full border-2 border-white" />
        )}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            isCurrentUser ? "text-orange-900" : "text-gray-900"
          }`}
        >
          {entry.name || "Anonymous"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {isCurrentUser ? "You" : "Competitor"}
        </p>
      </div>

      {}
      <div className="text-right px-4">
        <p className="text-sm font-bold text-gray-900 tabular-nums">
          {entry.weeklyXP}
        </p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">XP</p>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const dispatch: AppDispatch = useDispatch();

  const { leaderboard, error, currentUserId, status, league } = useSelector(
    (state: RootState) => state.leaderboard
  );

  const isLoading = status === "loading" || status === "idle";

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLeaderboard());
    }
  }, [status, dispatch]);

  const leagueImage = league
    ? LeaderboardImagesData.find(
        (imgData) => imgData.name.toLowerCase() === league.toLowerCase()
      )
    : null;

  const currentUserEntry = leaderboard.find(
    (entry) => entry.id === currentUserId
  );
  const displayName = currentUserEntry?.name || "Champion";

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-orange-400 rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm animate-pulse font-mono">
          Loading rankings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <Trophy className="text-gray-400 w-8 h-8" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Unable to load
        </h2>
        <p className="text-gray-500 text-sm max-w-sm text-center">{error}</p>
        <button
          onClick={() => dispatch(fetchLeaderboard())}
          className="mt-6 text-orange-500 font-medium hover:underline text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-white">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-100 pb-8 gap-6 md:gap-0">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
            Welcome, {displayName}
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            {league || "Global"} League
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Compete for the top spots. Resets every Sunday.
          </p>
        </div>

        {}
        <div className="flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100">
          {leagueImage ? (
            <Image
              src={leagueImage.imagePath}
              alt={leagueImage.name}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <Trophy className="w-6 h-6 text-orange-400" />
          )}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-mono tracking-wider">
              Current League
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {league || "Unranked"}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto">
        {}
        {!isLoading &&
          !error &&
          league &&
          currentUserId &&
          leaderboard.length > 0 && (
            <div className="mb-8">
              <LeagueStatusBar
                league={league}
                currentUserId={currentUserId}
                leaderboard={leaderboard}
              />
            </div>
          )}

        {}
        <div className="flex flex-col space-y-2">
          {leaderboard && leaderboard.length > 0 ? (
            <>
              {}
              <div className="flex px-4 py-2 text-xs font-mono text-gray-400 uppercase tracking-widest">
                <div className="w-12 text-center">Rank</div>
                <div className="w-6"></div>
                <div className="w-12"></div>
                <div className="flex-1 pl-4">User</div>
                <div className="px-4">XP</div>
              </div>

              {leaderboard.map((entry, index) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={index + 1}
                  isCurrentUser={entry.id === currentUserId}
                />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Trophy className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                League is empty
              </h3>
              <p className="text-gray-500 text-sm">
                Be the first to join the competition.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
