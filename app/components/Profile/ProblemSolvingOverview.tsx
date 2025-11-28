"use client";

import React, { useState } from "react";

type StatDetail = {
  total: number;
  solved: number;
  submissions: number;
  acceptedSubmissions: number;
};

type DifficultyStats = {
  all: StatDetail;
  Beginner: StatDetail;
  Intermediate: StatDetail;
  Advanced: StatDetail;
};

interface Props {
  stats: DifficultyStats;
}

export default function ProblemSolvingOverview({ stats }: Props) {
  const [hovered, setHovered] = useState<
    "Beginner" | "Intermediate" | "Advanced" | null
  >(null);

  const activeData = hovered ? stats[hovered] : stats.all;

  const acceptanceRate =
    activeData.submissions > 0
      ? (
          (activeData.acceptedSubmissions / activeData.submissions) *
          100
        ).toFixed(1)
      : "0";

  const progressPercentage =
    activeData.total > 0 ? (activeData.solved / activeData.total) * 100 : 0;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-gray-200 transition-colors duration-300">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Problem Solving
        </h3>
      </div>

      <div className="flex items-center justify-between gap-6">
        {}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#f9fafb"
              strokeWidth="5"
            />
            {}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={hovered ? getHoverColor(hovered) : "#18181b"}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-colors duration-300 ease-out"
            />
          </svg>

          {}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hovered ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                {}
                <div className="flex items-baseline -mb-1">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">
                    {acceptanceRate}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-0.5">
                    %
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-1">
                  Acceptance
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <span className="text-2xl font-bold text-gray-900 tracking-tight -mb-1">
                  {activeData.solved}
                </span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-1">
                  Solved
                </span>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex-1 space-y-1">
          <DifficultyRow
            label="Easy"
            count={stats.Beginner.solved}
            total={stats.Beginner.total}
            activeColor="bg-emerald-500"
            hoverTextColor="text-emerald-600"
            onEnter={() => setHovered("Beginner")}
            onLeave={() => setHovered(null)}
            isHovered={hovered === "Beginner"}
          />

          <DifficultyRow
            label="Medium"
            count={stats.Intermediate.solved}
            total={stats.Intermediate.total}
            activeColor="bg-amber-500"
            hoverTextColor="text-amber-600"
            onEnter={() => setHovered("Intermediate")}
            onLeave={() => setHovered(null)}
            isHovered={hovered === "Intermediate"}
          />

          <DifficultyRow
            label="Hard"
            count={stats.Advanced.solved}
            total={stats.Advanced.total}
            activeColor="bg-rose-500"
            hoverTextColor="text-rose-600"
            onEnter={() => setHovered("Advanced")}
            onLeave={() => setHovered(null)}
            isHovered={hovered === "Advanced"}
          />
        </div>
      </div>
    </div>
  );
}

function DifficultyRow({
  label,
  count,
  total,
  activeColor,
  hoverTextColor,
  onEnter,
  onLeave,
  isHovered,
}: {
  label: string;
  count: number;
  total: number;
  activeColor: string;
  hoverTextColor: string;
  onEnter: () => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group flex items-center justify-between py-2 px-2 cursor-default rounded-md transition-colors"
    >
      <div className="flex items-center gap-3">
        {}
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            isHovered ? activeColor : "bg-gray-200"
          }`}
        />
        <span
          className={`text-sm font-medium transition-colors duration-200 ${
            isHovered ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="text-sm tracking-tight">
        <span
          className={`font-semibold transition-colors duration-200 ${
            isHovered ? hoverTextColor : "text-gray-900"
          }`}
        >
          {count}
        </span>
        <span className="text-gray-300 font-light mx-1">/</span>
        <span className="text-gray-400 font-light">{total}</span>
      </div>
    </div>
  );
}

function getHoverColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "#10b981";
    case "Intermediate":
      return "#f59e0b";
    case "Advanced":
      return "#f43f5e";
    default:
      return "#f59120";
  }
}
