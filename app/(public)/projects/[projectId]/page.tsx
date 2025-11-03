"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Github,
  Link as LinkIcon,
  Loader2,
  Send,
  Clock,
  ImageIcon,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Code,
  FileText,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

type SubmissionStatus = {
  message: string | null;
  type: "success" | "error" | null;
};

type ProjectStatus =
  | "Loading"
  | "NotStarted"
  | "InProgress"
  | "Submitted"
  | "Expired";

const formatTimeLeft = (milliseconds: number) => {
  if (milliseconds <= 0) return "0d 0h 0m 0s";
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export default function IndividualProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [builtWith, setBuiltWith] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    message: null,
    type: null,
  });
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("Loading");
  const [timeLeft, setTimeLeft] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchInitialData = async () => {
      try {
        const [projectResponse, statusResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/status`),
        ]);

        if (!projectResponse.ok)
          throw new Error("Failed to load project details.");
        if (!statusResponse.ok)
          throw new Error("Failed to load project status.");

        const projectData: Project = await projectResponse.json();
        const statusData = await statusResponse.json();

        setProject(projectData);
        setProjectStatus(statusData.status);

        if (statusData.status === "InProgress") {
          const maxTimeInMs =
            parseInt(projectData.maxTime) * 24 * 60 * 60 * 1000;
          const startTime = new Date(statusData.startedAt).getTime();
          setEndTime(startTime + maxTimeInMs);
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [projectId]);

  useEffect(() => {
    if (projectStatus !== "InProgress" || !endTime) {
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft("Time's up!");
        setProjectStatus("Expired");
        clearInterval(intervalId);
      } else {
        setTimeLeft(formatTimeLeft(remaining));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [projectStatus, endTime]);

  const handleStartProject = async () => {
    if (!project) return;
    setIsStarting(true);
    try {
      const response = await fetch("/api/projects/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not start project.");
      }

      const maxTimeInMs = parseInt(project.maxTime) * 24 * 60 * 60 * 1000;
      const startTime = new Date(result.progress.startedAt).getTime();

      setEndTime(startTime + maxTimeInMs);
      setProjectStatus("InProgress");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ message: null, type: null });

    try {
      const builtWithArray = builtWith
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      const response = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          githubUrl,
          liveUrl,
          description,
          builtWith: builtWithArray,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to submit project.");

      setSubmissionStatus({ message: result.message, type: "success" });
      setGithubUrl("");
      setLiveUrl("");
      setDescription("");
      setBuiltWith("");
      setProjectStatus("Submitted");
    } catch (err) {
      if (err instanceof Error)
        setSubmissionStatus({ message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-white">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  if (!project)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-neutral-400">
        <p>Project not found.</p>
      </div>
    );

  const renderStatusAndForm = () => {
    switch (projectStatus) {
      case "NotStarted":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Ready to begin?</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Once you start, the {project.maxTime}-day timer will begin. Good
              luck!
            </p>
            <button
              onClick={handleStartProject}
              disabled={isStarting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5" />
                  Start Project
                </>
              )}
            </button>
          </div>
        );
      case "Submitted":
        return (
          <div className="text-center bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-300">
              Project Submitted!
            </h2>
            <p className="text-neutral-400 text-sm mt-2">
              Great job! Your submission has been recorded.
            </p>
          </div>
        );
      case "Expired":
        return (
          <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-300">
              Time&apos;s Up!
            </h2>
            <p className="text-neutral-400 text-sm mt-2">
              The deadline for this project has passed.
            </p>
          </div>
        );
      default:
        return (
          <div className="h-40 bg-neutral-800 rounded-lg animate-pulse"></div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#262626] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative aspect-video w-full bg-[#333] rounded-lg overflow-hidden mb-6 border border-neutral-700">
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-neutral-800">
                <ImageIcon className="w-16 h-16 text-neutral-600" />
              </div>
            )}
          </div>
          <div className="bg-[#333] rounded-lg p-6 border border-neutral-700">
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 mb-4">
              <span className="border border-gray-600 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {project.domain}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4" />
                <span>{project.maxTime} days to complete</span>
              </div>
            </div>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-[#333] rounded-lg p-6 border border-neutral-700 lg:sticky lg:top-8">
            {projectStatus === "InProgress" ? (
              <>
                <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-yellow-300 text-lg">
                    Time Left
                  </h3>
                  <p className="text-3xl font-mono tracking-wider text-white">
                    {timeLeft}
                  </p>
                </div>
                <h2 className="text-2xl font-semibold mb-6">
                  Submit Your Work
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                      Short Description (Optional)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
                        placeholder="A brief summary of your project..."
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="builtWith"
                      className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                      Technologies Used*
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Code className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="builtWith"
                        value={builtWith}
                        onChange={(e) => setBuiltWith(e.target.value)}
                        className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
                        placeholder="Next.js, Tailwind CSS, Prisma"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="githubUrl"
                      className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                      GitHub Repository URL*
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Github className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="githubUrl"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
                        placeholder="https://github.com/user/repo"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="liveUrl"
                      className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                      Live Deployed URL (Optional)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="liveUrl"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
                        placeholder="https://my-project.vercel.app"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !githubUrl || !builtWith}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Project
                        </>
                      )}
                    </button>
                  </div>
                  {submissionStatus.message && (
                    <p
                      className={`text-sm text-center ${
                        submissionStatus.type === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {submissionStatus.message}
                    </p>
                  )}
                </form>
              </>
            ) : (
              renderStatusAndForm()
            )}
          </div>
        </div>
      </div>
    </main>
  );
}