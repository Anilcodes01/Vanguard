import { Clock, Play, ShieldCheck, ChevronDown, Rocket, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  maxTimeInMinutes: number;
  submissionProgress: number;
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
  maxTimeInMinutes,
   submissionProgress,
}: EditorHeaderProps) => (
  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isStarted}>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 transition-colors h-auto"
        >
          {selectedLanguage.language}
          <ChevronDown
            className="h-4 w-4 text-gray-500"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-gray-100 border-gray-200 text-gray-900"
        align="start"
      >
        <DropdownMenuRadioGroup
          value={selectedLanguage.languageId.toString()}
          onValueChange={(value) => {
            const newLang = availableLanguages.find(
              (lang) => lang.languageId.toString() === value
            );
            if (newLang) onLanguageChange(newLang);
          }}
        >
          {availableLanguages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.languageId}
              value={lang.languageId.toString()}
              className="focus:bg-orange-500/10 focus:text-orange-300 cursor-pointer"
            >
              {lang.language}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    {isStarted ? (
      <div
        className={`flex items-center gap-2 font-mono font-semibold text-base ${timerColor}`}
      >
        <Clock size={16} />
        <span>{displayTime}</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock size={15} />
        <span>{maxTimeInMinutes} min</span>
      </div>
    )}

    <div className="flex items-center gap-3">
      {!isStarted && (
        <Button
          onClick={onStart}
          className="bg-orange-500 text-white hover:bg-orange-600 h-auto px-4 py-1.5"
        >
          <ShieldCheck size={16} className="mr-2" />
          Start
        </Button>
      )}
    <Button
        onClick={onRun}
        variant="secondary"
        disabled={!isStarted || isRunning || isSubmitting}
        className="bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 h-auto px-4 py-1.5 flex justify-center items-center"
      >
        {isRunning ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Running...
            </>
        ) : (
            <>
              <Play size={15} className="mr-2" />
              Run Code
            </>
        )}
      </Button>
      <Button
            onClick={onSubmit}
            disabled={!isStarted || isRunning || isSubmitting}
            className="relative overflow-hidden bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 h-auto px-4 py-1.5"
        >
            <div
                className="absolute top-0 left-0 h-full bg-orange-800/70 transition-all duration-300"
                style={{ width: `${submissionProgress}%` }}
            />
            <span className="relative z-10 flex items-center">
              <Rocket size={15} className="mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </span>
        </Button>
    </div>
  </div>
);