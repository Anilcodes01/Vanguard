import { LEAGUE_HIERARCHY } from '@/app/constants/leagues';
import { getWeekEndDateUTC } from '@/lib/dateUtils';
import { LeaderboardEntry } from '@/app/store/features/leaderboard/leaderboardSlice';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const PROMOTION_ZONE = 3;
const DEMOTION_ZONE = 5;

export const LeagueStatusBar = ({
  league,
  currentUserId,
  leaderboard,
}: {
  league: string;
  currentUserId: string;
  leaderboard: LeaderboardEntry[];
}) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0 });
  const currentUserIndex = leaderboard.findIndex(e => e.id === currentUserId);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : -1;
  const currentUserEntry = leaderboard[currentUserIndex];
  const currentLeagueIndex = LEAGUE_HIERARCHY.indexOf(league);
  const nextLeague = currentLeagueIndex < LEAGUE_HIERARCHY.length - 1
    ? LEAGUE_HIERARCHY[currentLeagueIndex + 1]
    : league; 

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endDate = getWeekEndDateUTC();
      const timeLeft = endDate.getTime() - now.getTime();

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeRemaining({ days, hours });
      } else {
        setTimeRemaining({ days: 0, hours: 0 });
      }
    };

    calculateTimeRemaining();
    const timerId = setInterval(calculateTimeRemaining, 1000 * 60); 

    return () => clearInterval(timerId); 
  }, []);
  
  if (currentUserRank === -1) {
    return null; 
  }

  const totalMembers = leaderboard.length;
  const promotionPercent = (PROMOTION_ZONE / totalMembers) * 100;
  const demotionPercent = (DEMOTION_ZONE / totalMembers) * 100;
  const safePercent = 100 - promotionPercent - demotionPercent;
  const userPositionPercent = ((currentUserRank - 0.5) / totalMembers) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
        <span className="font-semibold text-orange-500">
          Promote to {nextLeague}
        </span>
        <span>
          Ends in: <span className="font-semibold text-black">{timeRemaining.days}d {timeRemaining.hours}h</span>
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
        <div className="flex h-full rounded-full overflow-hidden">
          <div className="bg-orange-500" style={{ width: `${promotionPercent}%` }}></div>
          <div className="bg-gray-300" style={{ width: `${safePercent}%` }}></div>
          <div className="bg-red-500" style={{ width: `${demotionPercent}%` }}></div>
        </div>
        <div 
          className="absolute top-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-all duration-500 shadow-lg"
          style={{ left: `calc(${userPositionPercent}% - 10px)` }}
          title={`You are rank ${currentUserRank}`}
        >
          <Image
            src={currentUserEntry.avatar_url || `https://ui-avatars.com/api/?name=${currentUserEntry.name || "A"}&background=f59120&color=fff`}
            alt="Your rank"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full object-cover border-2 border-white"
            priority
          />
        </div>
      </div>
    </div>
  );
};