import { Clock, PlayIcon, ShieldCheck, ChevronDown } from "lucide-react";
import { ProblemLanguageDetail } from "@/types";

interface EditorHeaderProps {
  onStart: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isStarted: boolean;
  isRunning: boolean;
  isSubmitting: boolean;
  displayTime: string;
  timerColor: string;
  availableLanguages: ProblemLanguageDetail[];
  selectedLanguage: ProblemLanguageDetail;
  onLanguageChange: (language: ProblemLanguageDetail) => void;
}

export const EditorHeader = ({
  onStart,
  onRun,
  onSubmit,
  isStarted,
  isRunning,
  isSubmitting,
  displayTime,
  timerColor,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
}: EditorHeaderProps) => (
  <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
    <div className="relative">
      <select
        value={selectedLanguage.languageId}
        onChange={(e) => {
          const newLang = availableLanguages.find(lang => lang.languageId === Number(e.target.value));
          if (newLang) {
            onLanguageChange(newLang);
          }
        }}
        disabled={isStarted}
        className="bg-zinc-700 text-white text-sm rounded-md pl-3 pr-8 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      >
        {availableLanguages.map(lang => (
          <option key={lang.languageId} value={lang.languageId}>
            {lang.language}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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