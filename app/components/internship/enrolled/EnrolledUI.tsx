"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import InternshipWeekCard from "./InternshipWeekCard";
import axios from "axios";
import { LoadingSpinner } from "../../Profile/ProfilePanel";

interface EnrolledUIProps {
  userName: string;
}

interface InternshipWeekData {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  problems: { isCompleted: boolean }[];
  projects: { isCompleted: boolean }[];
  isLocked: boolean; // Field comes directly from API
}

interface InternshipApiResponse {
  internship: InternshipWeekData[];
}

export default function EnrolledUI({ userName }: EnrolledUIProps) {
  const [internshipWeeks, setInternshipWeeks] = useState<InternshipWeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchInternshipData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const response = await axios.get<InternshipApiResponse>(
          "/api/internship/generateInternshipWeeks"
        );
        setInternshipWeeks(response.data.internship);
      } catch (err) {
        console.error("Failed to fetch internship data:", err);
        setError("Could not load curriculum.");
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipData();
  }, []);

  const { overallProgress, completedWeeksCount, totalTasksCompleted } =
    useMemo(() => {
      if (!internshipWeeks.length)
        return {
          overallProgress: 0,
          completedWeeksCount: 0,
          totalTasksCompleted: 0,
        };

      let totalProgressSum = 0;
      let weeksFullyDone = 0;
      let tasksDone = 0;

      internshipWeeks.forEach((week) => {
        const problems = week.problems || [];
        const projects = week.projects || [];
        const totalItems = problems.length + projects.length;
        const completedItems =
          problems.filter((p) => p.isCompleted).length +
          projects.filter((p) => p.isCompleted).length;

        tasksDone += completedItems;

        if (totalItems > 0) {
          const ratio = completedItems / totalItems;
          totalProgressSum += ratio;
          if (ratio === 1) weeksFullyDone++;
        }
      });

      return {
        overallProgress: Math.min((totalProgressSum / 12) * 100, 100),
        completedWeeksCount: weeksFullyDone,
        totalTasksCompleted: tasksDone,
      };
    }, [internshipWeeks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-12 md:px-12 max-w-7xl mx-auto font-sans">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-2">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            {userName} / Internship
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
            12-Week Roadmap
          </h1>
        </div>

        <div className="w-full md:w-64 space-y-3">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-500">Completion</span>
            <span className="font-mono font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>

          <div className="h-[2px] w-full bg-gray-100">
            <div
              className="h-full bg-gray-900 transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>{completedWeeksCount}/12 Weeks</span>
            <span>{totalTasksCompleted} Tasks</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {internshipWeeks.map((weekData) => {
          const totalProblems = weekData.problems?.length || 0;
          const totalProjects = weekData.projects?.length || 0;
          const totalItems = totalProblems + totalProjects;
          const completedProblems =
            weekData.problems?.filter((p) => p.isCompleted).length || 0;
          const completedProjects =
            weekData.projects?.filter((p) => p.isCompleted).length || 0;
          const completedCount = completedProblems + completedProjects;

          return (
            <InternshipWeekCard
              key={weekData.id}
              weekNumber={weekData.weekNumber}
              title={weekData.title}
              description={weekData.description}
              topics={weekData.topics}
              completedCount={completedCount}
              totalCount={totalItems}
              isLocked={weekData.isLocked} // Logic is handled by DB/API now
            />
          );
        })}
      </div>
    </div>
  );
}