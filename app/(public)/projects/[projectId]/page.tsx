"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import ProjectDetails from "@/app/components/Projects/ProjectDetails";
import ProjectSidebar from "@/app/components/Projects/ProjectSidebar";
import LoadingSpinner from "@/app/components/Projects/LoadingSpinner";
import ErrorMessage from "@/app/components/Projects/ErrorMessage";
import SubmissionModal from "@/app/components/Projects/SubmissionModel";

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

type ProjectDataResponse = {
  project: Project;
  status: ProjectStatus;
  startedAt?: string;
  completionCount: number;
};

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
  const [completionCount, setCompletionCount] = useState<number>(0);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load project data.");
        }
        const data: ProjectDataResponse = await response.json();
        setProject(data.project);
        setProjectStatus(data.status);
        setCompletionCount(data.completionCount);
        if (data.status === "InProgress" && data.startedAt) {
          const maxTimeInMs =
            parseInt(data.project.maxTime) * 24 * 60 * 60 * 1000;
          const startTime = new Date(data.startedAt).getTime();
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


const onRemoveCoverImage = () => {
  setCoverImageFile(null);
};

const onRemoveScreenshot = (indexToRemove: number) => {
  setScreenshotFiles(prevFiles => 
    prevFiles.filter((_, index) => index !== indexToRemove)
  );
};

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

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
    }
  };

  const handleScreenshotsChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshotFiles(Array.from(e.target.files));
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ message: null, type: null });

     const { data: { user } } = await supabase.auth.getUser();

    try {
      setIsUploading(true);
      let coverImageUrl: string | undefined = undefined;
      if (coverImageFile) {
        const coverImagePath = `public/${projectId}/${Date.now()}-${
          coverImageFile.name
        }`;
        coverImageUrl = await uploadFile(
          coverImageFile,
          "SubmittedProjects",
          coverImagePath
        );
      }

      const screenshotUrls: string[] = [];
      for (const file of screenshotFiles) {
        const screenshotPath = `public/${projectId}/screenshots/${Date.now()}-${
          file.name
        }`;
        const url = await uploadFile(
          file,
          "SubmittedProjects",
          screenshotPath
        );
        screenshotUrls.push(url);
      }
      setIsUploading(false);

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
          coverImage: coverImageUrl,
          screenshots: screenshotUrls,
          name: project?.name,
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
      setCoverImageFile(null);
      setScreenshotFiles([]);
      setProjectStatus("Submitted");
      setIsModalOpen(false); 
    } catch (err) {
      if (err instanceof Error)
        setSubmissionStatus({ message: err.message, type: "error" });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#262626] text-gray-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <ProjectDetails project={{ ...project, completionCount }} />
            </div>
            <div className="lg:col-span-5">
              <ProjectSidebar
                project={project}
                projectStatus={projectStatus}
                timeLeft={timeLeft}
                isStarting={isStarting}
                handleStartProject={handleStartProject}
                handleOpenSubmitModal={() => setIsModalOpen(true)} 
              />
            </div>
          </div>
        </div>
      </main>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleSubmit={handleSubmit}
        description={description}
        setDescription={setDescription}
        builtWith={builtWith}
        setBuiltWith={setBuiltWith}
        githubUrl={githubUrl}
        setGithubUrl={setGithubUrl}
        liveUrl={liveUrl}
        setLiveUrl={setLiveUrl}
        handleCoverImageChange={handleCoverImageChange}
        handleScreenshotsChange={handleScreenshotsChange}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        submissionStatus={submissionStatus}
         onRemoveCoverImage={onRemoveCoverImage}
  onRemoveScreenshot={onRemoveScreenshot}
  coverImageFile={coverImageFile}
  screenshotFiles={screenshotFiles}
      />
    </>
  );
}