import ProjectStatus from "./ProjectStatus";
import { Send, CheckCheck } from "lucide-react";
import { ProjectSidebarProps } from "@/types";

const renderContent = (props: ProjectSidebarProps) => {
  const { projectStatus, timeLeft, handleOpenSubmitModal } = props;

  if (projectStatus === "Loading") {
    return <div className="h-48 bg-gray-800 rounded-lg animate-pulse"></div>;
  }

  if (projectStatus === "Submitted") {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-3 p-8">
        <div className="bg-green-500/10 p-3 rounded-full">
          <CheckCheck className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white pt-2">
          Project Submitted!
        </h3>
        <p className="text-gray-400 text-sm">
          Well done! Your project is now under review.
        </p>
      </div>
    );
  }

  if (projectStatus === "InProgress") {
    return (
      <div className="space-y-8 text-center p-6">
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
  const isSubmitted = props.projectStatus === "Submitted";
  const bgColor = isSubmitted ? "bg-[#2D2D2D]" : "bg-gray-800/50";

  return (
    <div className="lg:sticky lg:top-8">
      <div
        className={`${bgColor} rounded-xl ring-1 ring-white/10 transition-colors duration-300`}
      >
        {renderContent(props)}
      </div>
    </div>
  );
}
