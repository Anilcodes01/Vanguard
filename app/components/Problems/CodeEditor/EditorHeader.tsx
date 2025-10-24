import { Clock, Play, ShieldCheck, ChevronDown, Rocket } from "lucide-react";
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
}: EditorHeaderProps) => (
  <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isStarted}>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 transition-colors h-auto"
        >
          {selectedLanguage.language}
          <ChevronDown
            className="h-4 w-4 text-neutral-500"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-neutral-800 border-neutral-700 text-neutral-200"
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
              className="focus:bg-sky-500/10 focus:text-sky-300 cursor-pointer"
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
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Clock size={15} />
        <span>{maxTimeInMinutes} min</span>
      </div>
    )}

    <div className="flex items-center gap-3">
      {!isStarted && (
        <Button
          onClick={onStart}
          className="bg-sky-500 text-white hover:bg-sky-600 h-auto px-4 py-1.5"
        >
          <ShieldCheck size={16} className="mr-2" />
          Start
        </Button>
      )}
      <Button
        onClick={onRun}
        variant="secondary"
        disabled={!isStarted || isRunning || isSubmitting}
        className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 h-auto px-4 py-1.5"
      >
        <Play size={15} className="mr-2" />
        {isRunning ? "Running..." : "Run Code"}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={!isStarted || isRunning || isSubmitting}
        className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 h-auto px-4 py-1.5"
      >
        <Rocket size={15} className="mr-2" />
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  </div>
);
