import { ChevronRight, Code2, Lock, Clock } from "lucide-react";
import { InternshipProblem } from "@/app/(public)/internship/types";
import Link from "next/link";

interface ExtendedInternshipProblem extends InternshipProblem {
  isLocked?: boolean;
  unlockAt?: string | null;
  originalProblemId?: string;
}

interface ProblemGridProps {
  problems: ExtendedInternshipProblem[];

  startDate?: string | Date | null;
}

export default function ProblemGrid({ problems }: ProblemGridProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coding Drills</h2>
          <p className="text-gray-500 text-sm mt-1">
            Problems unlock daily after you start the project.
          </p>
        </div>
        <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
          {problems.length} Challenges
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((problem, idx) => {
          const isUnlocked = !problem.isLocked;

          const problemId = problem.originalProblemId || problem.id;
          const href = `/problems/${problemId}`;

          let lockMessage = "Locked";
          if (problem.isLocked) {
            if (!problem.unlockAt) {
              lockMessage = "Start project to unlock";
            } else {
              const diffMs = new Date(problem.unlockAt).getTime() - Date.now();
              const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              lockMessage = `Unlocks in ${daysLeft} ${
                daysLeft === 1 ? "day" : "days"
              }`;
            }
          }

          const Content = (
            <div
              className={`h-full rounded-xl border transition-all duration-300 flex flex-col relative
              ${
                isUnlocked
                  ? "bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200 cursor-pointer group"
                  : "bg-gray-50 border-gray-200 opacity-80 grayscale-[0.2] cursor-not-allowed"
              }`}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors
                    ${
                      isUnlocked
                        ? "bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-600"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={`p-2 rounded-full transition-colors
                    ${
                      isUnlocked
                        ? "bg-gray-50 group-hover:bg-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {isUnlocked ? (
                      <Code2 className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <h4
                  className={`text-lg font-bold mb-2 line-clamp-2 transition-colors
                  ${
                    isUnlocked
                      ? "text-gray-900 group-hover:text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {problem.title}
                </h4>

                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              <div
                className={`p-4 border-t rounded-b-xl flex justify-between items-center transition-colors
                ${
                  isUnlocked
                    ? "border-gray-100 bg-gray-50/50 group-hover:bg-orange-50/30"
                    : "border-gray-200 bg-gray-100"
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {problem.isCompleted ? "Solved" : "Unsolved"}
                    </span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Solve <ChevronRight className="w-4 h-4 text-orange-500" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Day {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lockMessage}
                    </span>
                  </>
                )}
              </div>
            </div>
          );

          return isUnlocked ? (
            <Link href={href} key={problem.id} className="block h-full">
              {Content}
            </Link>
          ) : (
            <div key={problem.id} className="block h-full select-none">
              {Content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
