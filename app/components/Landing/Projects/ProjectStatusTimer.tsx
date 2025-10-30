"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ProjectStatusTimerProps {
  startedAt: string;
  maxTime: string;
}

const formatTimeLeft = (milliseconds: number) => {
  if (milliseconds <= 0) return { text: "Time's up!", isExpired: true };

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  return { text: `${days}d ${hours}h left`, isExpired: false };
};

export default function ProjectStatusTimer({
  startedAt,
  maxTime,
}: ProjectStatusTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    text: "Calculating...",
    isExpired: false,
  });

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();
    const maxTimeInMs = parseInt(maxTime) * 24 * 60 * 60 * 1000;
    const endTime = startTime + maxTimeInMs;

    const intervalId = setInterval(() => {
      const remaining = endTime - Date.now();
      setTimeLeft(formatTimeLeft(remaining));

      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000 * 60);

    setTimeLeft(formatTimeLeft(endTime - Date.now()));

    return () => clearInterval(intervalId);
  }, [startedAt, maxTime]);

  const textColor = timeLeft.isExpired ? "text-red-400" : "text-yellow-400";

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${textColor}`}>
      <Clock size={16} />
      <span>{timeLeft.text}</span>
    </div>
  );
}
