"use client";

import React, { useState, useEffect } from "react";
import InternshipWeekCard from "./InternshipWeekCard";
import axios from "axios";

interface EnrolledUIProps {
  userName: string;
}

interface InternshipWeekData {
  week: string;
  topic: string;
  project: {
    title: string;
    description: string;
  };
  problem: {
    title: string;
    description: string;
  };
}

interface InternshipApiResponse {
  internship: InternshipWeekData[];
}

export default function EnrolledUI({ userName }: EnrolledUIProps) {
  const [internshipWeeks, setInternshipWeeks] = useState<InternshipWeekData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternshipData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<InternshipApiResponse>(
          "/api/internship/weeks"
        );
        setInternshipWeeks(response.data.internship);
      } catch (err) {
        console.error("Failed to fetch internship data:", err);
        setError(
          "Failed to load internship curriculum. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-lg text-[#f59120]">
        Loading internship curriculum...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 text-lg">
        Error: {error}
      </div>
    );
  }

  if (internshipWeeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-lg text-gray-500">
        No internship curriculum found for {userName}.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 w-full min-h-screen items-center py-12 px-4 md:px-8 lg:px-16">
      <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-4">
            Welcome to Your{" "}
            <span className="text-orange-500 relative">
              12-Week Internship
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-orange-300 opacity-50"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-700 mt-6 max-w-3xl mx-auto">
            A structured journey designed just for you. One project + one challenge per week to transform you into a job-ready developer.
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {internshipWeeks.map((weekData, index) => (
          <InternshipWeekCard
            key={index}
            week={weekData.week}
            topic={weekData.topic}
            projectTitle={weekData.project.title}
            problemTitle={weekData.problem.title}
          />
        ))}
      </div>
    </div>
  );
}
