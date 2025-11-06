"use client";

import { Book, BrainCircuit, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Difficulty } from "@prisma/client";

type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string[];
  _count: {
    solutions: number;
  };
};

const getDifficultyClass = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Intermediate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Advanced":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function ProblemCard({ problem }: { problem: Problem }) {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/problems/${problem.id}`);
      }}
      className="group flex flex-col cursor-pointer h-full bg-[#2a2a2a] rounded-2xl p-5 border border-neutral-700/50 shadow-lg shadow-black/20 hover:border-blue-400/50 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
    >
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <BrainCircuit size={28} className="text-blue-400" />
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyClass(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-100 truncate mb-2 group-hover:text-blue-300 transition-colors">
          {problem.title}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <Book size={16} className="text-neutral-500" />
          <p className="text-sm text-gray-400 truncate">
            {problem.topic.join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-700/50 flex justify-between items-center text-xs text-gray-400">
        <span className="inline-flex items-center gap-2 font-medium">
          <Users size={16} className="text-green-400" />
          {problem._count.solutions} Solves
        </span>
        <span className="text-blue-400 font-semibold group-hover:underline">
          View Problem →
        </span>
      </div>
    </div>
  );
}