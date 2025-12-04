import {
  Play,
  ChevronDown,
  Rocket,
  Loader2,
  Shuffle,
  ArrowRight,
  Paintbrush,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProblemStarterTemplate } from "@/types";

interface EditorHeaderProps {
  onRun: () => void;
  onSubmit: () => void;
  onFormat: () => void;
  onNext: () => void;
  onRandom: () => void;
  hasNext: boolean;
  isRunning: boolean;
  isSubmitting: boolean;
  starterTemplates: ProblemStarterTemplate[];
  selectedLanguage: ProblemStarterTemplate;
  onLanguageChange: (language: ProblemStarterTemplate) => void;
  submissionProgress: number;
}

export const EditorHeader = ({
  onRun,
  onSubmit,
  onFormat,
  onNext,
  onRandom,
  hasNext,
  isRunning,
  isSubmitting,
  starterTemplates,
  selectedLanguage,
  onLanguageChange,
  submissionProgress,
}: EditorHeaderProps) => (
  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isRunning || isSubmitting}>
          <Button
            variant="ghost"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#f59120] disabled:opacity-50 transition-colors h-auto"
          >
            {selectedLanguage.language}
            <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 bg-gray-100 border-gray-200 text-gray-900"
          align="start"
        >
          <DropdownMenuRadioGroup
            value={selectedLanguage.language}
            onValueChange={(value) => {
              const newLang = starterTemplates.find(
                (lang) => lang.language === value
              );
              if (newLang) onLanguageChange(newLang);
            }}
          >
            {starterTemplates.map((lang) => (
              <DropdownMenuRadioItem
                key={lang.id}
                value={lang.language}
                className="focus:bg-[#f59120]/10 focus:text-orange-300 cursor-pointer"
              >
                {lang.language}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block"></div>

      {}
      <div className="flex items-center gap-1">
        {}
        <Button
          variant="ghost"
          size="sm"
          onClick={onFormat}
          title="Format Code"
          disabled={isRunning || isSubmitting}
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 h-8"
        >
          <Paintbrush size={16} />
          <span className="sr-only">Format</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRandom}
          title="Random Problem"
          className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-2 h-8"
        >
          <Shuffle size={16} />
          <span className="sr-only">Random</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          title={hasNext ? "Next Problem" : "No more problems"}
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 h-8 disabled:opacity-30"
        >
          <ArrowRight size={18} />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <Button
        onClick={onRun}
        variant="secondary"
        disabled={isRunning || isSubmitting}
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
        disabled={isRunning || isSubmitting}
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
