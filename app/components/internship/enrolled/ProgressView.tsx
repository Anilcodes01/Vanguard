'use client'
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProgressView({
  onBack,
  journalCount,
  problemsCompleted,
  interactionsCount,
  createdAt,
  weekNumber,
}: {
  onBack: () => void;
  journalCount: number;
  problemsCompleted: number;
  interactionsCount: number;
  createdAt?: string | Date;
  weekNumber: number;
}) {
  const [timeLeft, setTimeLeft] = useState("00:00:00:00");

  useEffect(() => {
    if (!createdAt) {
      setTimeLeft("00:00:00:00");
      return;
    }

    const startDate = new Date(createdAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const endDate = startDate + sevenDaysInMs;

    const updateTimer = () => {
      const now = Date.now();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00:00");
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
  }, [createdAt]);

  const renderBoxes = (count: number, max: number = 7) => {
    return (
      <div className="flex gap-2 mt-3">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 md:w-6 md:h-6 rounded-sm transition-all duration-300 ${
              i < count
                ? "bg-orange-500 border border-orange-600"
                : "bg-gray-100 border border-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 animate-in fade-in zoom-in duration-300">
      {}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
        {}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-48 relative">
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Journals
          </span>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {journalCount}
          </div>
          <p className="text-sm text-gray-500 mb-2">Entries Recorded</p>
          {renderBoxes(journalCount)}
        </div>

        {}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-48 relative">
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Problems
          </span>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {problemsCompleted}
          </div>
          <p className="text-sm text-gray-500 mb-2">Challenges Solved</p>
          {renderBoxes(problemsCompleted)}
        </div>

        {}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-48 relative">
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Activity
          </span>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {interactionsCount}
          </div>
          <p className="text-sm text-gray-500 mb-2">Total Actions</p>
          {renderBoxes(interactionsCount)}
        </div>
      </div>

      {}
      <div className="w-full md:w-1/3 bg-orange-600 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-md text-white">
        {}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-3xl -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="w-full flex justify-between items-start mb-6">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-right">
              <h3 className="text-lg font-bold uppercase tracking-widest opacity-90">
                Week {weekNumber}
              </h3>
              <p className="text-orange-100 text-xs font-medium">
                Deadline Timer
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-4xl md:text-5xl font-mono font-bold tracking-wider text-center">
              {timeLeft}
            </div>
            <p className="mt-2 text-orange-100 text-sm">Time Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}