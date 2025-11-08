import { FormEvent } from "react";
import ProjectStatus from "./ProjectStatus";
import { Send } from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

type ProjectSidebarProps = {
  project: Project;
  projectStatus:
    | "Loading"
    | "NotStarted"
    | "InProgress"
    | "Submitted"
    | "Expired";
  timeLeft: string;
  isStarting: boolean;
  handleStartProject: () => void;
  handleOpenSubmitModal: () => void;
};

const renderContent = (props: ProjectSidebarProps) => {
  const { projectStatus, timeLeft, handleOpenSubmitModal } = props;

  if (projectStatus === "Loading") {
    return <div className="h-48 bg-gray-800 rounded-lg animate-pulse"></div>;
  }

  if (projectStatus === "InProgress") {
    return (
      <div className="space-y-8 text-center">
        <div>
          <p className="text-sm text-gray-400 mb-1">Time Remaining</p>
          <p className="text-4xl font-mono tracking-wider text-white">
            {timeLeft}
          </p>
        </div>
        <button
          onClick={handleOpenSubmitModal}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 transition-colors duration-200"
        >
          <Send className="h-5 w-5" />
          <span>Submit Your Project</span>
        </button>
      </div>
    );
  }

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
    <div className="lg:sticky lg:top-8">
      <div className="bg-gray-800/50 rounded-xl p-6 ring-1 ring-white/10">
        {renderContent(props)}
      </div>
    </div>
  );
}
