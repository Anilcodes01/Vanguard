import Link from "next/link";
import { ArrowLeft, CheckCircle, NotebookPen } from "lucide-react";

interface WeekHeaderProps {
  weekNumber: number;
  title: string;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  onOpenNotes: () => void;
}

export default function WeekHeader({
  weekNumber,
  title,
  completedCount,
  totalCount,
  progressPercentage,
  onOpenNotes,
}: WeekHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {}
        <div className="flex items-center gap-4">
          <Link
            href="/internship"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <h1 className="text-sm md:text-base font-bold text-gray-900">
              Week {weekNumber}
            </h1>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="text-xs md:text-sm font-medium text-orange-600 truncate max-w-[150px] md:max-w-xs">
              {title}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center gap-4 md:gap-6">
          {}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="hidden sm:inline">Progress</span>
              <span
                className={
                  progressPercentage === 100
                    ? "text-green-600"
                    : "text-gray-900"
                }
              >
                {Math.round(progressPercentage)}%
              </span>
            </div>
            {}
            <div className="w-24 md:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  progressPercentage === 100 ? "bg-green-500" : "bg-orange-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

          {}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
            <CheckCircle
              className={`w-3.5 h-3.5 ${
                completedCount === totalCount
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>

          {}
          <button
            onClick={onOpenNotes}
            className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all group flex items-center justify-center relative"
            title="Weekly Journal"
          >
            <NotebookPen className="w-5 h-5 group-hover:text-orange-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
