"use client";

import { useState } from "react";
import {
  Code2,
  Briefcase,
  FolderGit2,
  Link as LinkIcon,
  Loader2,
  Eye,
} from "lucide-react";
import { fetchMoreSubmissions } from "@/app/actions/ProfileActions";
import { SubmissionModal } from "./SubmissionModal";

interface SubmissionItem {
  id: string;
  status: string;
  createdAt: string;
  problem: {
    title: string;
    difficulty: string;
  };
}

interface ProjectItem {
  id: string;
  title: string;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
  type: "Personal" | "Internship";
}

interface ActivityTabsProps {
  initialSubmissions: SubmissionItem[];
  initialProjects: ProjectItem[];
  totalSubmissionsCount: number;
  totalProjectsCount: number;
  userId: string;
}

export default function ActivityTabs({
  initialSubmissions,
  initialProjects,
  totalSubmissionsCount,
  totalProjectsCount,
  userId,
}: ActivityTabsProps) {
  const [activeTab, setActiveTab] = useState<"problems" | "projects">(
    "problems"
  );
  const [submissions, setSubmissions] =
    useState<SubmissionItem[]>(initialSubmissions);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [projects] = useState<ProjectItem[]>(initialProjects);

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Accepted
          </span>
        );
      case "WrongAnswer":
      case "Wrong Answer":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Wrong Answer
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {status}
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    let colorClass = "bg-gray-100 text-gray-600";
    let label = difficulty;

    switch (difficulty) {
      case "EASY":
      case "Beginner":
        colorClass = "bg-emerald-50 text-emerald-700";
        label = "Easy";
        break;
      case "MEDIUM":
      case "Intermediate":
        colorClass = "bg-amber-50 text-amber-700";
        label = "Med";
        break;
      case "HARD":
      case "Advanced":
        colorClass = "bg-rose-50 text-rose-700";
        label = "Hard";
        break;
    }

    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  const handleLoadMoreSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const newItems = await fetchMoreSubmissions(userId, submissionsPage);
      setSubmissions((prev) => [...prev, ...newItems]);
      setSubmissionsPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load submissions", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {}
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setActiveTab("problems")}
            className={`py-4 mr-6 text-sm font-medium transition-all relative ${
              activeTab === "problems"
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Problems
            {activeTab === "problems" && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`py-4 text-sm font-medium transition-all relative ${
              activeTab === "projects"
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Projects
            {activeTab === "projects" && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black"></span>
            )}
          </button>
        </div>

        <div className="min-h-[300px] flex flex-col">
          {activeTab === "problems" ? (
            submissions.length > 0 ? (
              <>
                <div className="divide-y divide-gray-50">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 text-sm font-medium truncate max-w-[150px] sm:max-w-md">
                            {submission.problem.title}
                          </p>
                          {getDifficultyBadge(submission.problem.difficulty)}
                        </div>
                        <p className="text-gray-400 text-xs">
                          {formatDate(submission.createdAt)}
                        </p>
                      </div>

                      {}
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          {getStatusIndicator(submission.status)}
                        </div>

                        {}
                        <button
                          onClick={() => setSelectedSubmissionId(submission.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Code"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {submissions.length < totalSubmissionsCount && (
                  <div className="p-4 text-center border-t border-gray-50">
                    <button
                      onClick={handleLoadMoreSubmissions}
                      disabled={isLoadingSubmissions}
                      className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
                    >
                      {isLoadingSubmissions ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                <Code2 size={24} className="mb-2 opacity-50" />
                <p className="text-sm">No problem history</p>
              </div>
            )
          ) : projects.length > 0 ? (
            <>
              {}
              <div className="divide-y divide-gray-50">
                {projects.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-medium truncate max-w-[150px] sm:max-w-md">
                          {item.title}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.type === "Internship"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-black transition-colors"
                          title="GitHub"
                        >
                          <FolderGit2 size={16} />
                        </a>
                      )}
                      {item.liveUrl && (
                        <a
                          href={item.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-[#f59120] transition-colors"
                          title="Live Site"
                        >
                          <LinkIcon size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <Briefcase size={24} className="mb-2 opacity-50" />
              <p className="text-sm">No project history</p>
            </div>
          )}
        </div>
      </div>

      {}
      {selectedSubmissionId && (
        <SubmissionModal
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}
    </>
  );
}
