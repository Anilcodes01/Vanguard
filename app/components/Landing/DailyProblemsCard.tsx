import { DailyProblem } from "@/types";
import { ArrowRight, BarChart3, Clock, Code, Zap } from "lucide-react";
import Link from "next/link";

export const DailyProblemCard = ({ problem }: { problem: DailyProblem }) => {
  const difficultyMap: {
    [key: string]: { color: string; xp: number; label: string };
  } = {
    Beginner: { color: "text-emerald-400", xp: 100, label: "Beginner" },
    Intermediate: { color: "text-yellow-400", xp: 150, label: "Intermediate" },
    Advanced: { color: "text-red-400", xp: 200, label: "Advanced" },
  };

  const problemDifficulty = difficultyMap[problem.difficulty] || {
    color: "text-neutral-400",
    xp: 0,
    label: "Unknown",
  };

  return (
    <div className=" p-6 rounded-2xl bg-white flex flex-col justify-between shadow-lg border border-gray-200">
      <div>
        <div className="mb-3">
          <p className="text-sm font-medium text-[#f59120] mb-1">
            Daily Challenge
          </p>
          <h2 className="text-xl font-bold text-black tracking-tight">
            {problem.title}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {problem.topic.map((t, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-x-4 gap-y-1  text-xs flex-wrap">
          <div className="flex items-center gap-1.5" title="Experience Points">
            <Zap size={14} className="text-[#f59120]" />
            <span className="font-semibold text-gray-800">{problemDifficulty.xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5" title="Difficulty">
            <BarChart3 size={14} className={problemDifficulty.color} />
            <span className={`font-semibold ${problemDifficulty.color}`}>
              {problemDifficulty.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title="Maximum Time">
            <Clock size={14} className="text-cyan-400" />
            <span className="font-semibold text-gray-800">{problem.maxTime}min</span>
          </div>
        </div>
        
        <Link href={`/problems/${problem.id}`}>
          <button className="bg-[#f59120] hover:bg-orange-700 text-white cursor-pointer text- font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-1.5 text-sm group">
            Solve
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </Link>
      </div>
    </div>
  );
};

export const AllProblemsSolvedCard = () => (
  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-center items-center text-center">
    <h3 className="text-lg font-bold text-black mb-2">
      You&apos;re on Fire! 🔥
    </h3>
    <p className="text-gray-600 text-sm mb-4">
      You&apos;ve solved all available problems. More are coming soon!
    </p>
    <Link href="/problems" className="w-full">
      <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
        <Code size={16} />
        Browse Problems
      </button>
    </Link>
  </div>
);