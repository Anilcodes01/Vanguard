import Link from "next/link";
import React from "react";

interface InternshipWeekProps {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
}

export default function InternshipWeekCard({
  weekNumber,
  title,
  description,
  topics,
}: InternshipWeekProps) {
  return (
    <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
      {}
      <Link
        href={{
          pathname: `/internship/${weekNumber}`,

          query: {
            title: title,
          },
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-[#f59120]">
              Week {weekNumber}
            </h3>
            <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              Locked & Loaded
            </span>
          </div>

          <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
            {title}
          </h4>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
            {description}
          </p>

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">
              Key Topics:
            </p>
            <div className="flex flex-wrap gap-2">
              {topics.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 3 && (
                <span className="text-xs text-gray-400 px-1 py-1">
                  +{topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
