import { useState, useEffect } from "react";
import {
  Layers,
  ArrowLeft,
  BookOpen,
  Clock,
  Bot,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InternshipProject } from "@/app/(public)/internship/types";
import { FaCheck } from "react-icons/fa";

interface ProjectBannerProps {
  project: InternshipProject;
  showSpecs: boolean;
  onToggle: () => void;
  onOpenSubmitModal: () => void;
}

export default function ProjectBanner({
  project,
  showSpecs,
  onToggle,
  onOpenSubmitModal,
}: ProjectBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isReviewVisible, setIsReviewVisible] = useState(false);

  const reviewAvailableAt = project.reviewAvailableAt
    ? new Date(project.reviewAvailableAt).getTime()
    : null;

  const isReviewReady = reviewAvailableAt
    ? Date.now() >= reviewAvailableAt
    : false;

  useEffect(() => {
    if (!project.isCompleted || isReviewReady || !reviewAvailableAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = reviewAvailableAt - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);

        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [project.isCompleted, reviewAvailableAt, isReviewReady]);

  if (!project) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400 border-green-500/50 bg-green-500/10";
    if (score >= 5)
      return "text-orange-400 border-orange-500/50 bg-orange-500/10";
    return "text-red-400 border-red-500/50 bg-red-500/10";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl relative overflow-hidden transition-all duration-500">
      {}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-orange-500 opacity-10 rounded-full blur-3xl"></div>

      <div className="relative z-10 p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Layers className="w-4 h-4 text-orange-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-300">
                Capstone Project
              </span>
              {project.isCompleted && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase border border-green-500/30">
                  Submitted
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              {project.title}
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2 min-w-[180px]">
            {}
            <button
              onClick={onToggle}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform active:scale-95 ${
                showSpecs
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              {showSpecs ? (
                <>
                  <ArrowLeft className="w-4 h-4" /> Back
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" /> Specs
                </>
              )}
            </button>

            {}
            {!project.isCompleted ? (
              <button
                onClick={onOpenSubmitModal}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-500/20 shadow-lg transition-all transform active:scale-95"
              >
                <FaCheck /> Submit Project
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {}
                {isReviewReady ? (
                  <button
                    onClick={() => setIsReviewVisible(!isReviewVisible)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all"
                  >
                    <Bot className="w-4 h-4" />
                    {isReviewVisible ? "Hide Review" : "View AI Review"}
                    {isReviewVisible ? (
                      <ChevronUp className="w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm cursor-wait">
                    <div className="flex items-center gap-2 font-semibold text-orange-400">
                      <Clock className="w-4 h-4 animate-pulse" />
                      Analyzing...
                    </div>
                    <span className="text-xs opacity-75">
                      {timeLeft ? `Results in ${timeLeft}` : "Calculating..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {}
        {isReviewReady && isReviewVisible && project.aiScore !== null && (
          <div className="mt-8 pt-8 border-t border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-6 h-6 text-orange-400" />
              <h4 className="text-xl font-bold text-white">AI Code Review</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {}
              <div
                className={`col-span-1 rounded-xl border p-6 flex flex-col items-center justify-center text-center ${getScoreColor(
                  project.aiScore || 0
                )}`}
              >
                <span className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">
                  Code Score
                </span>
                <div className="text-6xl font-black mb-2">
                  {project.aiScore}
                  <span className="text-2xl opacity-50 font-normal">/10</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < (project.aiScore || 0)
                          ? "bg-current"
                          : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {}
              <div className="col-span-1 md:col-span-2 space-y-6">
                {}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Summary
                  </h5>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {project.aiFeedback}
                  </p>
                </div>

                {}
                {project.aiImprovements &&
                  project.aiImprovements.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        Suggested Improvements
                      </h5>
                      <ul className="space-y-2">
                        {project.aiImprovements.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-300"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
