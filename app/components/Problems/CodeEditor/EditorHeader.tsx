import { Clock, PlayIcon, ShieldCheck } from "lucide-react";
import { VscCode } from "react-icons/vsc";


export const EditorHeader = ({
  onStart,
  onRun,
  onSubmit,
  isStarted,
  isRunning,
  isSubmitting,
   displayTime,   
  timerColor, 
}: {
  onStart: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isStarted: boolean;
  isRunning: boolean;
  isSubmitting: boolean;
  displayTime: string;
  timerColor: string;
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
    <div className="flex items-center gap-4">
      <div className="flex gap-2 items-center text-white">
        <VscCode className="text-gray-400" />
        <span className="font-bold rounded-lg bg-gray-700 px-4 ">Code</span>
      </div>
      <span className="text-sm font-medium text-gray-200">JavaScript</span>
    </div>

     {isStarted && (
      <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timerColor}`}>
        <Clock size={18} />
        <span>{displayTime}</span>
      </div>
    )}

    <div className="flex items-center gap-4">
      {!isStarted && (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShieldCheck size={14} />
          Start
        </button>
      )}

      <button
        onClick={onRun}
        disabled={!isStarted || isRunning || isSubmitting}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 text-white text-sm font-semibold rounded-lg hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-gray-500 transition-colors"
      >
        <PlayIcon size={14} />
        {isRunning ? "Running..." : "Run"}
      </button>
      <button
        onClick={onSubmit}
        disabled={!isStarted || isRunning || isSubmitting}
        className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  </div>
);