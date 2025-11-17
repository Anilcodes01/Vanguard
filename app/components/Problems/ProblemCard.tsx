"use client";

import Link from "next/link";
import { BarChart3, Book, CheckCircle2, Clock, Star } from "lucide-react";
import { Difficulty } from "@prisma/client";

type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  maxTime: number;
  xp: number;
  topic: string[];
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
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

export default function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      href={`/problems/${problem.id}`}
      className="group flex flex-col cursor-pointer h-full bg-white rounded-2xl p-5 border border-gray-200 shadow-lg shadow-black/20 hover:border-orange-500/50 hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-black group-hover:text-orange-400 transition-colors pr-2">
            {problem.title}
          </h3>
          {problem.solved && (
            <CheckCircle2
              size={20}
              className="text-orange-400 flex-shrink-0"
              aria-label="Solved"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Book size={14} className="flex-shrink-0" />
          <p className="truncate" title={problem.topic.join(", ")}>
            {problem.topic.join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
        <Stat
          icon={Star}
          value={problem.xp}
          label="Max XP"
          className="text-yellow-400"
        />
        <Stat
          icon={BarChart3}
          value={problem.difficulty}
          label="Level"
          className="text-orange-400"
        />
        <Stat
          icon={Clock}
          value={`${problem.maxTime}m`}
          label="Max Time"
          className="text-rose-400"
        />
      </div>
    </Link>
  );
}

export const ProblemCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse">
    <div className="flex-grow">
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center gap-1">
        <div className="h-5 w-5 bg-gray-200 rounded-full mb-1"></div>
        <div className="h-4 w-8 bg-gray-200 rounded"></div>
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-5 w-5 bg-gray-200 rounded-full mb-1"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
        <div className="h-3 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-5 w-5 bg-gray-200 rounded-full mb-1"></div>
        <div className="h-4 w-6 bg-gray-200 rounded"></div>
        <div className="h-3 w-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);