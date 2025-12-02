import { DailyProblem } from "@/types";
import { ArrowRight, BarChart3, Code, Percent, Tag, Zap } from "lucide-react";
import Link from "next/link";

export const DailyProblemCard = ({ problem }: { problem: DailyProblem }) => {
  // Map Prisma Enums to UI styles
  const difficultyMap: {
    [key: string]: { color: string; xp: number; label: string; bg: string };
  } = {
    EASY: { 
      color: "text-emerald-500", 
      bg: "bg-emerald-100",
      xp: 100, 
      label: "Easy" 
    },
    MEDIUM: { 
      color: "text-yellow-500", 
      bg: "bg-yellow-100",
      xp: 250, 
      label: "Medium" 
    },
    HARD: { 
      color: "text-red-500", 
      bg: "bg-red-100",
      xp: 500, 
      label: "Hard" 
    },
  };

  // Fallback for safety
  const details = difficultyMap[problem.difficulty] || {
    color: "text-gray-400",
    bg: "bg-gray-100",
    xp: 0,
    label: "Unknown",
  };

  return (
    <div className="p-6 rounded-2xl bg-white flex flex-col justify-between shadow-lg border border-gray-200 hover:border-[#f59120]/30 transition-all duration-300">
      <div>
        <div className="mb-4 flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-[#f59120] mb-1 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} />
              Daily Challenge
            </p>
            <h2 className="text-2xl font-bold text-black tracking-tight leading-tight">
              {problem.title}
            </h2>
          </div>
          {/* Difficulty Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.bg} ${details.color}`}>
            {details.label}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {problem.tags.length > 0 ? (
            problem.tags.map((t, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md"
              >
                <Tag size={12} className="text-gray-400" />
                {t}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-x-6 gap-y-2 text-sm flex-wrap">
          {/* XP Stat */}
          <div className="flex items-center gap-1.5" title="Experience Points">
            <Zap size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-700">{details.xp} XP</span>
          </div>
          
          {/* Acceptance Rate Stat (Replaces Max Time) */}
          <div className="flex items-center gap-1.5" title="Acceptance Rate">
            <Percent size={16} className="text-blue-500" />
            <span className="font-bold text-gray-700">
              {problem.acceptanceRate}% Rate
            </span>
          </div>
        </div>
        
        <Link href={`/problems/${problem.id}`}>
          <button className="bg-[#f59120] hover:bg-orange-600 text-white cursor-pointer font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm group shadow-md shadow-[#f59120]/20">
            Solve Problem
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </Link>
      </div>
    </div>
  );
};

export const AllProblemsSolvedCard = () => (
  <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col justify-center items-center text-center">
    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
       <span className="text-2xl">🔥</span>
    </div>
    <h3 className="text-xl font-bold text-black mb-2">
      You&apos;re on Fire!
    </h3>
    <p className="text-gray-600 text-sm mb-6 max-w-md">
      You&apos;ve solved the daily challenge and all available problems. Check back later for more!
    </p>
    <Link href="/problems" className="w-full max-w-xs">
      <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
        <Code size={16} />
        Browse All Problems
      </button>
    </Link>
  </div>
);