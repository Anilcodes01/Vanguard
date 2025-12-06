import { DailyProblem } from "@/types";
import { ArrowRight, Briefcase, Zap } from "lucide-react";
import Link from "next/link";

export const DailyProblemCard = ({
  problem,
}: {
  problem: DailyProblem & { isInternship?: boolean };
}) => {

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:border-gray-300">
      {}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          {}
          <span
            className={`text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 ${
              problem.isInternship ? "text-blue-600" : "text-[#f59120]"
            }`}
          >
            {problem.isInternship ? (
              <>
                <Briefcase size={12} strokeWidth={3} /> INTERNSHIP TASK
              </>
            ) : (
              <>
                <Zap size={12} strokeWidth={3} /> DAILY CHALLENGE
              </>
            )}
          </span>

          {}
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {problem.title}
          </h2>
        </div>

        {}
      </div>

      {}
      <div className="flex flex-wrap gap-2 mb-8">
        {problem.tags && problem.tags.length > 0 ? (
          problem.tags.map((t, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
            >
              {t}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">No tags</span>
        )}
      </div>

      {}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-[#f59120] fill-[#f59120]" />
            <span>100 XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500 font-bold">%</span>
            <span>{problem.acceptanceRate}% Rate</span>
          </div>
        </div>

        <Link href={`/problems/${problem.id}`}>
          <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 group-hover:shadow-lg">
            {problem.isInternship ? "Start Task" : "Solve Problem"}
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export const AllProblemsSolvedCard = () => (
  <div className="bg-white p-8 rounded-2xl border border-gray-200 border-dashed flex flex-col justify-center items-center text-center">
    <div className="w-12 h-12 bg-orange-50 text-[#f59120] rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">🔥</span>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on Fire!</h3>
    <p className="text-gray-500 text-sm mb-6 max-w-md">
      You&apos;ve solved the daily challenge and all available problems.
    </p>
    <Link href="/problems">
      <button className="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm">
        Browse All Problems
      </button>
    </Link>
  </div>
);
