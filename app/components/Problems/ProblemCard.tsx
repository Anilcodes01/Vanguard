"use client";

import Link from "next/link";
import { BarChart3, Tag, CheckCircle2, Percent, Star } from "lucide-react";
import { Difficulty } from "@prisma/client";

// Updated Type Definition based on new Schema
type Problem = {
  id: string;
  title: string;
  slug?: string | null; // Added slug if you want to use it in the URL
  difficulty: Difficulty;
  acceptanceRate: number; // Replaced maxTime
  xp: number;
  tags: string[]; // Renamed from topic
  solved?: boolean;
};

const Stat = ({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  className?: string;
}) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <Icon size={20} className={`mb-1 ${className}`} />
    <span className="font-bold text-sm text-black">{value}</span>
    <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
  </div>
);

// Helper to format difficulty (EASY -> Easy)
const formatDifficulty = (diff: string) => {
  if (!diff) return "";
  return diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
};

export default function ProblemCard({ problem }: { problem: Problem }) {
  // Use slug for URL if available, otherwise fallback to ID
  const linkHref = `/problems/${problem.id}`;

  return (
    <Link
      href={linkHref}
      className="group flex flex-col justify-between cursor-pointer h-full bg-white rounded-2xl p-5 border border-gray-200 shadow-lg shadow-black/5 hover:border-[#f59120]/50 hover:shadow-[#f59120]/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-bold text-black group-hover:text-[#f59120] transition-colors pr-2 line-clamp-2 leading-tight">
            {problem.title}
          </h3>
          {problem.solved && (
            <CheckCircle2
              size={20}
              className="text-green-500 flex-shrink-0 mt-0.5"
              aria-label="Solved"
            />
          )}
        </div>
        
        {/* Tags Section */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Tag size={14} className="flex-shrink-0 text-gray-400" />
          <p className="truncate" title={problem.tags.join(", ")}>
            {problem.tags.length > 0 ? problem.tags.join(", ") : "General"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
        <Stat
          icon={Star}
          value={problem.xp}
          label="XP"
          className="text-yellow-500"
        />
        <Stat
          icon={BarChart3}
          value={formatDifficulty(problem.difficulty)}
          label="Level"
          className={`${
            problem.difficulty === "Hard"
              ? "text-red-500"
              : problem.difficulty === "Medium"
              ? "text-orange-500"
              : "text-green-500"
          }`}
        />
        <Stat
          icon={Percent}
          value={`${problem.acceptanceRate}%`}
          label="Acceptance"
          className="text-blue-500"
        />
      </div>
    </Link>
  );
}

export const ProblemCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse h-full flex flex-col">
    <div className="flex-grow">
      <div className="flex justify-between mb-3">
        <div className="h-6 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
      </div>
      <div className="flex gap-2 items-center mt-2">
         <div className="h-4 w-4 bg-gray-100 rounded"></div>
         <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-5 w-5 bg-gray-100 rounded mb-1"></div>
          <div className="h-4 w-8 bg-gray-100 rounded"></div>
          <div className="h-3 w-10 bg-gray-100 rounded mt-1"></div>
        </div>
      ))}
    </div>
  </div>
);