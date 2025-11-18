"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import LeaderboardWidget from "../../Landing/LeaderWidget";

export default function RightSidePanel() {
  const { leaderboard, league, currentUserId } = useSelector(
    (state: RootState) => ({
      leaderboard: state.dashboard.leaderboard,
      league: state.dashboard.league,
      currentUserId: state.dashboard.currentUserId,
    })
  );

  return (
    <div className="hidden lg:block w-80 xl:w-96 border-l border-gray-200 bg-white p-6 overflow-y-auto">
      <LeaderboardWidget
        leaderboard={leaderboard}
        league={league}
        currentUserId={currentUserId}
        isLoading={false}
        error={null}
      />
    </div>
  );
}