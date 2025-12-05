"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, Bell } from "lucide-react";
import dynamic from "next/dynamic";
import {
  InternshipWeekData,
  NoteEntry,
  CARD_ORDER,
  InternshipProject,
} from "../types";
import WeekHeader from "@/app/components/internship/enrolled/WeekHeader";
import ProjectBanner from "@/app/components/internship/enrolled/ProjectBanner";
import ProblemGrid from "@/app/components/internship/enrolled/ProblemGrid";
import ModuleCarousel from "@/app/components/internship/enrolled/ModuleCarousal";
import SubmitProjectModal from "@/app/components/internship/enrolled/SubmitProjectModel";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";

const WeekJournalModal = dynamic(
  () => import("@/app/components/internship/enrolled/WeekJournalModal"),
  {
    ssr: false,
  }
);

export default function IndividualInternshipWeek() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSubscribed, subscribeToNotifications } = usePushNotifications();
  const weekNumberInt = parseInt(params.week as string);
  const topicParam = searchParams.get("topic");
  const projectTitleParam = searchParams.get("projectTitle");

  const [data, setData] = useState<InternshipWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  const [fetchedNotes, setFetchedNotes] = useState<NoteEntry[]>([]);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isFetchingJournal, setIsFetchingJournal] = useState(false);

  const hasFetched = useRef(false);

  const fetchData = async () => {
    try {
      if (!data) setLoading(true);

      const res = await fetch("/api/internship/generateWeekData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: weekNumberInt,
          topic: topicParam || "Web Development",
          projectTitle: projectTitleParam || "Weekly Project",
          projectDescription:
            "Focus on the core concepts and build the project.",
        }),
      });

      const jsonData = await res.json();
      if (!res.ok)
        throw new Error(jsonData.error || "Failed to load curriculum");

      setData(jsonData.data || jsonData);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    if (weekNumberInt) {
      hasFetched.current = true;
      fetchData();
    }
  }, [weekNumberInt, topicParam, projectTitleParam]);

  const handleProjectStarted = () => {
    fetchData();
  };

  useEffect(() => {
    if (!weekNumberInt) return;
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/notes?weekNumber=${weekNumberInt}`);
        if (res.ok) {
          const json = await res.json();
          setFetchedNotes(json.notes || []);
        }
      } catch (error) {
        console.error("Error fetching notes for banner:", error);
      }
    };
    fetchNotes();
  }, [weekNumberInt]);

  const handleOpenJournal = async () => {
    setIsJournalOpen(true);

    if (!fetchedNotes.length) {
      setIsFetchingJournal(true);
      try {
        const res = await fetch(`/api/notes?weekNumber=${weekNumberInt}`);
        if (res.ok) {
          const json = await res.json();
          setFetchedNotes(json.notes || []);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsFetchingJournal(false);
      }
    }
  };

  const handleSaveJournal = async (
    content: string,
    type: "general" | "problem" | "project",
    entityId?: string
  ) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: weekNumberInt,
          content,
          type,
          entityId,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error("Failed to save");

      setFetchedNotes((prev) => {
        const filtered = prev.filter((n) => n.id !== result.note.id);
        return [...filtered, result.note];
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save note.");
    }
  };

  const sortedWalkthroughs = useMemo(() => {
    if (!data?.walkthroughs) return [];
    return [...data.walkthroughs].sort((a, b) => {
      const indexA = CARD_ORDER.indexOf(a.cardType);
      const indexB = CARD_ORDER.indexOf(b.cardType);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return indexA === -1 ? 1 : indexB === -1 ? -1 : 0;
    });
  }, [data]);

  const progressStats = useMemo(() => {
    if (!data) return { completed: 0, total: 0, percentage: 0 };

    const totalProblems = data.problems.length;
    const totalItems = totalProblems + 1;

    const completedProblems = data.problems.filter((p) => p.isCompleted).length;
    const isProjectCompleted = data.projects[0]?.isCompleted ? 1 : 0;

    const completedCount = completedProblems + isProjectCompleted;
    const percentage = (completedCount / totalItems) * 100;

    return {
      completed: completedCount,
      total: totalItems,
      percentage: percentage,
    };
  }, [data]);

  const handleProjectSubmit = async (submissionData: {
    customTitle: string;
    shortDescription: string;
    tags: string[];
    githubLink: string;
    liveLink: string;
    overview: string;
    screenshots: string[];
  }) => {
    if (!data || !data.projects[0]) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/internship/submitProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: data.projects[0].id,
          title: submissionData.customTitle,
          shortDescription: submissionData.shortDescription,
          tags: submissionData.tags,
          githubLink: submissionData.githubLink,
          liveLink: submissionData.liveLink,
          overview: submissionData.overview,
          screenshots: submissionData.screenshots,
          weekNumber: data.weekNumber || weekNumberInt,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Submission failed");
      }

      setData((prevData) => {
        if (!prevData) return null;
        const updatedProjects = prevData.projects.map((proj) =>
          proj.id === result.project.id ? result.project : proj
        );
        return { ...prevData, projects: updatedProjects };
      });

      alert("Project submitted successfully! AI is reviewing your code.");
      setIsSubmitModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to submit project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
        <h2 className="text-lg font-medium text-gray-800">
          Generating Curriculum...
        </h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Unable to Load Week
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalActivity = fetchedNotes.length + progressStats.completed;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-20">
      {!isSubscribed && (
        <button
          onClick={subscribeToNotifications}
          className="fixed bottom-4 right-4 cursor-pointer bg-[#e16024] text-white p-2 rounded-full shadow-lg z-50 flex items-center gap-2 hover:bg-[#f35221] transition-all"
        >
          <Bell className="w-5 h-5" />
        </button>
      )}

      <WeekHeader
        weekNumber={data.weekNumber || weekNumberInt}
        title={data.title}
        completedCount={progressStats.completed}
        totalCount={progressStats.total}
        progressPercentage={progressStats.percentage}
        onOpenNotes={handleOpenJournal}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSpecs ? (
          <ModuleCarousel
            modules={sortedWalkthroughs}
            onClose={() => setShowSpecs(false)}
            projectId={data.projects[0]?.id}
            project={data.projects[0]}
            onProjectStart={handleProjectStarted}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ProjectBanner
              project={data.projects[0]}
              showSpecs={showSpecs}
              onToggle={() => setShowSpecs(true)}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
               timerStartDate={data.projects[0]?.startedAt || undefined}
              weekNumber={data.weekNumber || weekNumberInt}
              journalCount={fetchedNotes.length}
              problemsCompleted={progressStats.completed}
              problemsTotal={progressStats.total}
              interactionsCount={totalActivity}
            />
           <ProblemGrid 
              problems={data.problems} 
              startDate={data.projects[0]?.startedAt} 
            />
          </div>
        )}
      </main>

      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleProjectSubmit}
        isSubmitting={isSubmitting}
      />

      <WeekJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        weekNumber={weekNumberInt}
        isLoading={isFetchingJournal}
        availableProblems={
          data?.problems.map((p) => ({ id: p.id, title: p.title })) || []
        }
        availableProjects={
          data?.projects.map((p) => ({ id: p.id, title: p.title })) || []
        }
        fetchedNotes={fetchedNotes}
        onSave={handleSaveJournal}
      />
    </div>
  );
}
