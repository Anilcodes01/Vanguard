"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Play,
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
  const parsedData = React.useMemo(() => {
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

export default function ModuleCarousel({
  modules,
  onClose,
  projectId,
  project,
  onProjectStart,
}: ModuleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  const currentModule = modules[currentIndex];
  const style = getCardStyle(currentModule?.cardType || "default");
  const hasStarted = !!project?.startedAt;

  const handleNext = useCallback(() => {
    if (currentIndex < modules.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, modules.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

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
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (!currentModule) return null;

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#F9FAFB] rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-10 gap-4">
        {}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900 hidden sm:block">
              Project Walkthrough
            </h2>
            <p className="text-xs text-gray-500">
              Step {currentIndex + 1} of {modules.length}
            </p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-4">
          {}
          {!hasStarted ? (
            <button
              onClick={handleStartProject}
              disabled={isStarting}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              {isStarting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {isStarting ? "Starting..." : "Start Project"}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
          )}

          {}
          <div className="hidden md:flex flex-col w-48 gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>Progress</span>
              <span>
                {Math.round(((currentIndex + 1) / modules.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${((currentIndex + 1) / modules.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-gray-50/50">
        {}
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
          disabled={currentIndex === modules.length - 1}
          className={`hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full shadow-lg border border-gray-100 transition-all z-20 ${
            currentIndex === modules.length - 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {}
        <div className="w-full max-w-3xl h-full p-4 md:p-6 overflow-hidden flex flex-col justify-center">
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

          {}
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
              {currentIndex + 1} / {modules.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === modules.length - 1}
              className={`p-2 rounded-lg ${
                currentIndex === modules.length - 1
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
