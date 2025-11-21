"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { InternshipWeekData } from "../types";
import WeekHeader from "@/app/components/internship/enrolled/WeekHeader";
import ProjectBanner from "@/app/components/internship/enrolled/ProjectBanner";
import ProblemGrid from "@/app/components/internship/enrolled/ProblemGrid";
import ModuleCarousel from "@/app/components/internship/enrolled/ModuleCarousal";

const CARD_ORDER = [
  'case_study', 'problem_definition', 'objective', 'prerequisites', 
  'deliverables', 'rules', 'action_plan'
];

export default function IndividualInternshipWeek() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const weekNumberInt = parseInt(params.week as string);
  const topicParam = searchParams.get("topic");
  const projectTitleParam = searchParams.get("projectTitle");
  
  const [data, setData] = useState<InternshipWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const res = await fetch("/api/internship/generateWeekData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week: weekNumberInt,
            topic: topicParam || "Web Development",
            projectTitle: projectTitleParam || "Weekly Project",
            projectDescription: "Focus on the core concepts and build the project.",
          }),
        });

        const jsonData = await res.json();
        if (!res.ok) throw new Error(jsonData.error || "Failed to load curriculum");
        setData(jsonData.data || jsonData);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (weekNumberInt) fetchData();
  }, [weekNumberInt, topicParam, projectTitleParam]);

  const sortedWalkthroughs = useMemo(() => {
    if (!data?.walkthroughs) return [];
    return [...data.walkthroughs].sort((a, b) => {
      const indexA = CARD_ORDER.indexOf(a.cardType);
      const indexB = CARD_ORDER.indexOf(b.cardType);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return (indexA === -1) ? 1 : (indexB === -1) ? -1 : 0;
    });
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
        <h2 className="text-lg font-medium text-gray-800">Generating Curriculum...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Week</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-20">
      <WeekHeader 
        weekNumber={data.weekNumber} 
        title={data.title} 
        totalProblems={data.problems.length} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSpecs ? (
          <ModuleCarousel 
            modules={sortedWalkthroughs} 
            onClose={() => setShowSpecs(false)} 
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ProjectBanner 
              project={data.projects[0]} 
              showSpecs={showSpecs} 
              onToggle={() => setShowSpecs(true)} 
            />
            <ProblemGrid problems={data.problems} />
          </div>
        )}
      </main>
    </div>
  );
}