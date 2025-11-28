"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import LeaderboardWidget from "../../Landing/LeaderWidget";
import JournalsWidget from "../../Landing/JournalsWidget";

export default function RightSidePanel() {
  const { leaderboard, league, currentUserId } = useSelector(
    (state: RootState) => ({
      leaderboard: state.dashboard.leaderboard,
      league: state.dashboard.league,
      currentUserId: state.dashboard.currentUserId,
    })
  );

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-200 bg-white h-screen sticky top-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-6 ">
        <LeaderboardWidget
          leaderboard={leaderboard}
          league={league}
          currentUserId={currentUserId}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="-mt-8">
          <JournalsWidget />
        </div>
      </div>
    </aside>
  );
}
