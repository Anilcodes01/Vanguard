// components/ProjectStatus.tsx
import {
  Loader2,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type ProjectStatusProps = {
  status: "NotStarted" | "Submitted" | "Expired";
  maxTime: string;
  isStarting: boolean;
  onStartProject: () => void;
};

export default function ProjectStatus({
  status,
  maxTime,
  isStarting,
  onStartProject,
}: ProjectStatusProps) {
  switch (status) {
    case "NotStarted":
      return (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Ready to begin?</h2>
          <p className="text-neutral-400 text-sm mb-6">
            Once you start, the {maxTime}-day timer will begin. Good luck!
          </p>
          <button
            onClick={onStartProject}
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
          <h2 className="text-2xl font-semibold text-red-300">Time&apos;s Up!</h2>
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
}