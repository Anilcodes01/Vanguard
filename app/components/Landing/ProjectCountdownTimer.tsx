"use client";

import { useState, useEffect } from "react";

interface ProjectCountdownTimerProps {
  startedAt: string;
  maxTime: string;
}

const formatTimeLeft = (milliseconds: number) => {
  if (milliseconds <= 0) {
    return { text: "Time's up!", isExpired: true };
  }

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days}d ${hours}h left`, isExpired: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m left`, isExpired: false };
  }
  return { text: `${minutes}m left`, isExpired: false };
};

export default function ProjectCountdownTimer({
  startedAt,
  maxTime,
}: ProjectCountdownTimerProps) {
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
      const formatted = formatTimeLeft(remaining);
      setTimeLeft(formatted);

      if (formatted.isExpired) {
        clearInterval(intervalId);
      }
    }, 1000 * 60);

    setTimeLeft(formatTimeLeft(endTime - Date.now()));

    return () => clearInterval(intervalId);
  }, [startedAt, maxTime]);

  const textColor = timeLeft.isExpired
    ? "text-red-400 font-bold"
    : "text-yellow-400 font-semibold";

  return <span className={textColor}>{timeLeft.text}</span>;
}
