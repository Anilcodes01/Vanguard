import { FormEvent, ChangeEvent } from "react";
import SubmissionForm from "./SubmissionForm";
import ProjectStatus from "./ProjectStatus";

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

type ProjectSidebarProps = {
  project: Project;
  projectStatus: "Loading" | "NotStarted" | "InProgress" | "Submitted" | "Expired";
  timeLeft: string;
  isStarting: boolean;
  handleStartProject: () => void;
  handleSubmit: (e: FormEvent) => void;
  description: string;
  setDescription: (value: string) => void;
  builtWith: string;
  setBuiltWith: (value: string) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
  liveUrl: string;
  setLiveUrl: (value: string) => void;
  handleCoverImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleScreenshotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  submissionStatus: SubmissionStatus;
};

const renderContent = (
  { projectStatus, timeLeft, ...props }: ProjectSidebarProps
) => {
  if (projectStatus === "InProgress") {
    return (
      <>
        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-yellow-300 text-lg">Time Left</h3>
          <p className="text-3xl font-mono tracking-wider text-white">
            {timeLeft}
          </p>
        </div>
        <h2 className="text-2xl font-semibold mb-6">Submit Your Work</h2>
        <SubmissionForm {...props} />
      </>
    );
  }

  if (projectStatus === "Loading") {
    return (
      <div className="h-40 bg-neutral-800 rounded-lg animate-pulse"></div>
    );
  }

  // At this point, projectStatus can only be "NotStarted", "Submitted", or "Expired"
  return (
    <ProjectStatus
      status={projectStatus}
      maxTime={props.project.maxTime}
      isStarting={props.isStarting}
      onStartProject={props.handleStartProject}
    />
  );
};

export default function ProjectSidebar(props: ProjectSidebarProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-[#333] rounded-lg p-6 border border-neutral-700 lg:sticky lg:top-8">
        {renderContent(props)}
      </div>
    </div>
  );
}