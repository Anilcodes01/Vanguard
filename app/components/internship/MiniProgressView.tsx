"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

interface MiniProgressProps {
  weekNumber: number;
  startedAt?: string | Date;
  journalCount: number;
  problemsCompleted: number;
  totalProblems: number;
  interactionsCount: number;
}

export default function MiniProgressView({
  weekNumber,
  startedAt,
  journalCount,
  problemsCompleted,
  totalProblems,
  interactionsCount,
}: MiniProgressProps) {
  const [timeLeft, setTimeLeft] = useState("00:00:00:00");

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft("00:00:00:00");
      return;
    }

    const startDate = new Date(startedAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const endDate = startDate + sevenDaysInMs;

    const updateTimer = () => {
      const now = Date.now();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft("Time's Up");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const format = (n: number) => n.toString().padStart(2, "0");
      setTimeLeft(
        `${format(days)}:${format(hours)}:${format(minutes)}:${format(seconds)}`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const renderBoxes = (count: number, max: number = 7) => {
    const limit = max > 0 ? max : 5;

    const visualLimit = Math.min(limit, 7);

    return (
      <div className="flex gap-1.5 mt-3">
        {Array.from({ length: visualLimit }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-[2px] transition-all duration-300 ${
              i < count
                ? "bg-orange-500 border border-orange-600"
                : "bg-gray-100 border border-gray-200"
            }`}
          />
        ))}
        {limit > 7 && <span className="text-xs text-gray-400 self-end">+</span>}
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
          {}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Journals
            </span>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {journalCount}
            </div>
            <p className="text-xs text-gray-500 mb-1">Entries Recorded</p>
            {renderBoxes(journalCount)}
          </div>

          {}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Problems
            </span>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {problemsCompleted}
              <span className="text-sm text-gray-400 font-medium ml-1">
                /{totalProblems}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">Challenges Solved</p>
            {}
            {renderBoxes(problemsCompleted, totalProblems)}
          </div>

          {}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Activity
            </span>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {interactionsCount}
            </div>
            <p className="text-xs text-gray-500 mb-1">Total Actions</p>
            {renderBoxes(interactionsCount)}
          </div>
        </div>

        {}
        <div className="lg:w-80 bg-orange-600 rounded-xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          {}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 border border-white/20 px-2 py-0.5 rounded-full">
                Week {weekNumber}
              </span>
              <Clock className="w-4 h-4 text-orange-100" />
            </div>

            <div className="text-3xl font-mono font-bold tracking-tight mt-1">
              {timeLeft}
            </div>
            <p className="text-orange-100 text-xs mt-1 mb-4">
              Deadline Remaining
            </p>
          </div>

          <Link
            href={`/internship/week/${weekNumber}`}
            className="relative z-10 w-full bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs uppercase tracking-wide py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            Continue Week
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
