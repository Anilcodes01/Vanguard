import Link from "next/link";
import React from "react";
import { CheckCircle2, Lock } from "lucide-react";

interface InternshipWeekProps {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  completedCount: number;
  totalCount: number;
}

export default function InternshipWeekCard({
  weekNumber,
  title,
  description,
  topics,
  completedCount,
  totalCount,
}: InternshipWeekProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isStarted = totalCount > 0;
  const isCompleted = isStarted && percentage === 100;

  return (
    <div className="bg-white text-black rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full group">
      <Link
        href={{
          pathname: `/internship/${weekNumber}`,
          query: { title: title },
        }}
        className="flex flex-col h-full"
      >
        <div className="p-6 flex flex-col h-full">
          {}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[#f59120] group-hover:text-[#d67b15] transition-colors">
              Week {weekNumber}
            </h3>
            {isCompleted ? (
              <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            ) : isStarted ? (
              <span className="text-xs  text-orange-500 px-2 py-1 rounded-full border ">
                In Progress
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          {}
          <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {title}
          </h4>

          <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow">
            {description}
          </p>

          {}
          <div className="mt-auto space-y-4">
            {}
            {isStarted && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Progress</span>
                  <span
                    className={
                      percentage === 100 ? "text-green-600" : "text-gray-900"
                    }
                  >
                    {percentage}% ({completedCount}/{totalCount})
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      percentage === 100 ? "bg-green-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {topics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="text-[10px] sm:text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200 font-medium"
                  >
                    {topic}
                  </span>
                ))}
                {topics.length > 3 && (
                  <span className="text-[10px] sm:text-xs text-gray-400 px-1 py-1 font-medium">
                    +{topics.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
