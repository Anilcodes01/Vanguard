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

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Problem Solving Overview
      </h3>

      <div className="flex flex-col-reverse md:flex-row items-center gap-8">
        {}
        <div className="flex-1 w-full space-y-3">
          {}
          <DifficultyCard
            label="Easy"
            count={stats.Beginner.solved}
            total={stats.Beginner.total}
            colorClass="text-green-600 bg-green-50 group-hover:bg-green-100"
            onEnter={() => setHovered("Beginner")}
            onLeave={() => setHovered(null)}
          />

          {}
          <DifficultyCard
            label="Med."
            count={stats.Intermediate.solved}
            total={stats.Intermediate.total}
            colorClass="text-yellow-600 bg-yellow-50 group-hover:bg-yellow-100"
            onEnter={() => setHovered("Intermediate")}
            onLeave={() => setHovered(null)}
          />

          {}
          <DifficultyCard
            label="Hard"
            count={stats.Advanced.solved}
            total={stats.Advanced.total}
            colorClass="text-red-600 bg-red-50 group-hover:bg-red-100"
            onEnter={() => setHovered("Advanced")}
            onLeave={() => setHovered(null)}
          />
        </div>

        {}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          {}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 120 120"
          >
            {}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            {}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={hovered ? getHoverColor(hovered) : "#f59120"}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hovered ? (
              <div className="animate-in fade-in zoom-in duration-200">
                <span className="text-3xl font-bold text-gray-900 block">
                  {acceptanceRate}
                  <span className="text-sm align-top">%</span>
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Acceptance
                </span>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-200">
                <span className="text-3xl font-bold text-gray-900 block">
                  {activeData.solved}
                  <span className="text-lg text-gray-400 font-normal">
                    /{activeData.total}
                  </span>
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Solved
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyCard({
  label,
  count,
  total,
  colorClass,
  onEnter,
  onLeave,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-default"
    >
      <span
        className={`text-sm font-medium px-2.5 py-1 rounded-md ${colorClass} transition-colors`}
      >
        {label}
      </span>
      <div className="text-sm">
        <span className="font-bold text-gray-900">{count}</span>
        <span className="text-gray-400">/{total}</span>
      </div>
    </div>
  );
}

function getHoverColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "#16a34a";
    case "Intermediate":
      return "#ca8a04";
    case "Advanced":
      return "#dc2626";
    default:
      return "#f59120";
  }
}
