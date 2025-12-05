"use client";

import React, { useState, useMemo, useEffect } from "react";
import { InternshipProject } from "@/app/(public)/internship/types";
import {
  ArrowLeft,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  Trophy,
  ListChecks,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Rocket,
  CheckCircle,
} from "lucide-react";
import { WalkthroughCardData } from "@/app/(public)/internship/types";

const MarkdownText = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const ContentParser = ({ content }: { content: string }) => {
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  if (Array.isArray(parsedData)) {
    return (
      <ul className="space-y-4">
        {parsedData.map((item: string, idx: number) => (
          <li
            key={idx}
            className="flex items-start gap-4 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100"
          >
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm">
              {idx + 1}
            </span>
            <span className="leading-relaxed text-sm md:text-base">
              <MarkdownText text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof parsedData === "object" && parsedData !== null) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(parsedData).map(([key, val]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <span className="font-semibold text-gray-800 capitalize mb-2 sm:mb-0 text-sm md:text-base">
              {key.replace(/_/g, " ")}
            </span>
            <span className="font-mono text-xs md:text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 break-all">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="prose prose-base max-w-none text-gray-600 leading-relaxed">
      {String(parsedData)
        .split("\n")
        .map((line, i) => (
          <p key={i} className="mb-3 last:mb-0">
            <MarkdownText text={line} />
          </p>
        ))}
    </div>
  );
};

const getCardStyle = (type: string) => {
  switch (type) {
    case "case_study":
      return {
        icon: <FileText className="w-5 h-5" />,
        color: "text-purple-600 bg-purple-50 border-purple-100",
      };
    case "problem_definition":
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        color: "text-red-600 bg-red-50 border-red-100",
      };
    case "objective":
      return {
        icon: <Trophy className="w-5 h-5" />,
        color: "text-yellow-600 bg-yellow-50 border-yellow-100",
      };
    case "action_plan":
      return {
        icon: <ListChecks className="w-5 h-5" />,
        color: "text-green-600 bg-green-50 border-green-100",
      };
    case "rules":
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        color: "text-orange-600 bg-orange-50 border-orange-100",
      };
    case "prerequisites":
      return {
        icon: <Layers className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50 border-blue-100",
      };

    case "START_PROJECT":
      return {
        icon: <Rocket className="w-5 h-5" />,
        color: "text-orange-600 bg-orange-50 border-orange-100",
      };
    default:
      return {
        icon: <BookOpen className="w-5 h-5" />,
        color: "text-gray-600 bg-gray-50 border-gray-100",
      };
  }
};

interface ModuleCarouselProps {
  modules: WalkthroughCardData[];
  onClose: () => void;
  projectId?: string;
  project?: InternshipProject;
  onProjectStart?: () => void;
}

const StartProjectCard = ({
  onStart,
  isLoading,
  hasStarted,
}: {
  onStart: () => void;
  isLoading: boolean;
  hasStarted: boolean;
}) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-full items-center justify-center text-center p-8">
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm mb-6 ${
        hasStarted
          ? "bg-green-50 border-green-100"
          : "bg-orange-50 border-orange-100"
      }`}
    >
      {hasStarted ? (
        <CheckCircle className="w-8 h-8 text-green-600" />
      ) : (
        <Rocket className="w-8 h-8 text-orange-600" />
      )}
    </div>
    <h3 className="font-bold text-gray-900 text-2xl mb-2">
      {hasStarted ? "Project In Progress!" : "You're All Set!"}
    </h3>
    <p className="text-gray-500 max-w-sm mb-8">
      {hasStarted
        ? "The countdown has begun. You can now close this guide and start working."
        : "You've reviewed the project specifications. Now it's time to start building. Good luck!"}
    </p>

    {!hasStarted && (
      <button
        onClick={onStart}
        disabled={isLoading}
        className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? "Starting..." : "Start the Project"}
      </button>
    )}
  </div>
);

export default function ModuleCarousel({
  modules,
  onClose,
  projectId,
  project,
  onProjectStart,
}: ModuleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  const modulesWithStartCard = useMemo(() => {
    const startCard: WalkthroughCardData = {
      id: "start-card",
      cardType: "START_PROJECT",
      title: "Ready to Begin?",
      content: "",
      internshipWeekId: modules[0]?.internshipWeekId || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return [...modules, startCard];
  }, [modules]);

  const currentModule = modulesWithStartCard[currentIndex];
  const style = getCardStyle(currentModule.cardType);

  const handleNext = () => {
    if (currentIndex < modulesWithStartCard.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, handleNext, handlePrev, onClose]);

  const handleStartProject = async () => {
    if (!projectId) {
      alert("Error: Project ID is missing.");
      return;
    }
    setIsStarting(true);
    try {
      const res = await fetch("/api/internship/startProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start the project.");
      }

      if (onProjectStart) {
        onProjectStart();
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#F9FAFB] rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Project Walkthrough
            </h2>
            <p className="text-xs text-gray-500">
              Step {currentIndex + 1} of {modulesWithStartCard.length}
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col w-64 gap-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Progress</span>
            <span>
              {Math.round(
                ((currentIndex + 1) / modulesWithStartCard.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${
                  ((currentIndex + 1) / modulesWithStartCard.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-gray-50/50">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full shadow-lg border border-gray-100 transition-all z-20 ${
            currentIndex === 0
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === modulesWithStartCard.length - 1}
          className={`hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full shadow-lg border border-gray-100 transition-all z-20 ${
            currentIndex === modulesWithStartCard.length - 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="w-full max-w-3xl h-full p-4 md:p-6 overflow-hidden flex flex-col justify-center">
          {currentModule.cardType === "START_PROJECT" ? (
           <StartProjectCard
              onStart={handleStartProject}
              isLoading={isStarting}
              hasStarted={!!project?.startedAt} // CORRECTED
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-full">
              <div
                className={`px-6 py-5 flex items-center justify-between border-b border-gray-100 ${
                  style.color.split(" ")[1]
                } bg-opacity-30 flex-shrink-0`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${style.color}`}
                  >
                    {style.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl">
                    {currentModule.title}
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 hidden sm:inline-block">
                  {currentModule.cardType.replace("_", " ")}
                </span>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <ContentParser content={currentModule.content} />
              </div>
            </div>
          )}

          <div className="md:hidden mt-4 bg-white border border-gray-200 shadow-sm p-3 rounded-xl flex justify-between items-center flex-shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg ${
                currentIndex === 0
                  ? "text-gray-300"
                  : "text-gray-700 bg-gray-50 shadow-sm border border-gray-200"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-gray-400">
              {currentIndex + 1} / {modulesWithStartCard.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === modulesWithStartCard.length - 1}
              className={`p-2 rounded-lg ${
                currentIndex === modulesWithStartCard.length - 1
                  ? "text-gray-300"
                  : "text-gray-700 bg-gray-50 shadow-sm border border-gray-200"
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}