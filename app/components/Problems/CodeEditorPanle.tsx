import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { BsCheck2Circle } from "react-icons/bs";
import {
  ChevronUp,
  Maximize,
  Plus,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { EditorHeader } from "./CodeEditor/EditorHeader";
import { RenderOutput } from "./CodeEditor/RenderOutput";
import { TestCaseInput } from "./CodeEditor/TestCaseInput";
import { mapLanguageToMonaco } from "@/lib/languageMappings";
import { SubmissionResult, ProblemLanguageDetail } from "@/types";

type TestCaseStatus = "pending" | "running" | "passed" | "failed";

interface CodeEditorPanelProps {
  problemId: string;
  code: string;
  maxTimeInMinutes: number;
  setCode: (code: string) => void;
  handleSubmit: (startTime: number | null) => void;
  handleRunCode: (activeCaseIndex: number) => void;
  isSubmitting: boolean;
  isCodeRunning: boolean;
  submissionResult: SubmissionResult | null;
  runResult: SubmissionResult | null;
  testCases: { id: number; input: string | null; expected: string | null }[];
  availableLanguages: ProblemLanguageDetail[];
  selectedLanguage: ProblemLanguageDetail;
  onLanguageChange: (language: ProblemLanguageDetail) => void;
  submissionProgress: number;
  testCaseStatuses: TestCaseStatus[];
  problemTitle: string;
  isMobileDetailsVisible: boolean;
  onToggleMobileDetails: () => void;
}

export default function CodeEditorPanel({
  code,
  maxTimeInMinutes,
  setCode,
  handleSubmit,
  handleRunCode,
  isSubmitting,
  isCodeRunning,
  submissionResult,
  runResult,
  testCases,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
  submissionProgress,
  testCaseStatuses,
  problemTitle,
  isMobileDetailsVisible,
  onToggleMobileDetails,
}: CodeEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const maxTimeInSeconds = maxTimeInMinutes * 60;
  const [isResizing, setIsResizing] = useState(false);
  const [editorHeight, setEditorHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  useEffect(() => {
    if (containerRef.current && editorHeight === null) {
      setEditorHeight(containerRef.current.offsetHeight * 0.8);
    }
  }, [editorHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerTop = containerRef.current.getBoundingClientRect().top;
        const newHeight = e.clientY - containerTop;
        const minHeight = 300;
        const bottomPanelMinHeight = 156;
        const resizerHeight = 8;
        const maxHeight =
          containerRef.current.offsetHeight -
          bottomPanelMinHeight -
          resizerHeight;
        if (newHeight > minHeight && newHeight < maxHeight) {
          setEditorHeight(newHeight);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isStarted || !startTime || submissionResult?.status === "Accepted") {
      return;
    }
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isStarted, startTime, submissionResult]);

  useEffect(() => {
    if (runResult || submissionResult) {
      setActiveTab("result");
    }
  }, [runResult, submissionResult]);

  const formatTime = (elapsedSeconds: number): string => {
    if (elapsedSeconds <= maxTimeInSeconds) {
      const remainingSeconds = maxTimeInSeconds - elapsedSeconds;
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    } else {
      const extraSeconds = elapsedSeconds - maxTimeInSeconds;
      const min = Math.floor(extraSeconds / 60);
      const sec = extraSeconds % 60;
      return `+${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
  };

  const getTimerColor = (elapsedSeconds: number): string => {
    if (elapsedSeconds > maxTimeInSeconds) {
      return "text-red-500";
    }
    const remainingSeconds = maxTimeInSeconds - elapsedSeconds;
    if (remainingSeconds <= 60) {
      return "text-orange-400";
    }
    return "text-gray-600";
  };

  const getTestCaseStatusStyle = (status: TestCaseStatus) => {
    switch (status) {
      case "running":
        return "bg-gray-200 text-black border border-orange-500";
      case "passed":
        return "bg-orange-100/60 text-orange-600 border border-orange-400";
      case "failed":
        return "bg-red-100/60 text-red-600 border border-red-400";
      default:
        return "bg-gray-100 text-gray-500 hover:bg-gray-200";
    }
  };

  const getTestCaseStatusIcon = (status: TestCaseStatus) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "passed":
        return <BsCheck2Circle className="h-4 w-4 text-orange-400" />;
      case "failed":
        return <X className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const displayResult = submissionResult || runResult;

  return (
    <div ref={containerRef} className=" flex flex-col h-full">
      <button
        onClick={onToggleMobileDetails}
        className="lg:hidden flex items-center justify-between w-full p-3 bg-gray-50 rounded-t-lg border-b border-gray-200 text-left"
      >
        <span className="font-semibold text-black truncate pr-4">
          {problemTitle}
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isMobileDetailsVisible ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="bg-gray-50 rounded-lg shadow-2xl flex flex-col overflow-hidden flex-shrink-0"
        style={{ height: editorHeight ? `${editorHeight}px` : "60%" }}
      >
        <EditorHeader
          onStart={handleStart}
          onRun={() => handleRunCode(activeCaseIndex)}
          onSubmit={() => handleSubmit(startTime)}
          isStarted={isStarted}
          isRunning={isCodeRunning && !isSubmitting}
          isSubmitting={isSubmitting}
          displayTime={formatTime(elapsedTime)}
          timerColor={getTimerColor(elapsedTime)}
          availableLanguages={availableLanguages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          maxTimeInMinutes={maxTimeInMinutes}
          submissionProgress={submissionProgress}
        />

        <div className="flex-grow relative">
          {!isStarted && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-300 font-semibold">Editor is locked.</p>
                <p className="text-gray-400 text-sm">
                  Click &quot;Start&quot; to begin coding.
                </p>
              </div>
            </div>
          )}
          <Editor
            height="100%"
            language={mapLanguageToMonaco(selectedLanguage.language)}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              readOnly: !isStarted,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 10 },
              contextmenu: !isStarted,
            }}
          />
        </div>
        <div className="flex justify-between items-center px-4 py-1 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
          <span>{isStarted ? "In Progress" : "Not Started"}</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      <div
        onMouseDown={handleMouseDown}
        className="w-full h-2 cursor-row-resize flex items-center justify-center group"
      >
        <div className="w-full h-[3px] bg-transparent group-hover:bg-orange-500/50 transition-colors duration-200"></div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab("testcase")}
              className={`flex items-center gap-2 p-1 rounded-md ${
                activeTab === "testcase" ? "text-black" : "text-gray-600"
              }`}
            >
              <BsCheck2Circle
                className={`${
                  activeTab === "testcase" ? "text-orange-400" : ""
                }`}
              />
              Testcase
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setActiveTab("result")}
              className={`p-1 rounded-md ${
                activeTab === "result" ? "text-black" : "text-gray-600"
              }`}
            >
              Test Result
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <button className="hover:text-gray-900">
              <Maximize size={16} />
            </button>
            <button className="hover:text-gray-900">
              <ChevronUp size={20} />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {activeTab === "testcase" && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-2 flex-wrap">
                {testCases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCaseIndex(index)}
                    disabled={isCodeRunning}
                    className={`flex justify-center items-center gap-2 w-24 h-8 px-3 py-1 text-sm rounded-lg transition-colors border ${
                      activeCaseIndex === index &&
                      testCaseStatuses[index] === "pending"
                        ? "bg-gray-200 text-black border-transparent"
                        : getTestCaseStatusStyle(testCaseStatuses[index])
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {getTestCaseStatusIcon(testCaseStatuses[index])}
                    <span>Case {index + 1}</span>
                  </button>
                ))}
                <button
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                  disabled={isCodeRunning}
                >
                  <Plus size={16} />
                </button>
              </div>
              <TestCaseInput input={testCases[activeCaseIndex]?.input} />
            </div>
          )}
          {activeTab === "result" && <RenderOutput result={displayResult} />}
        </div>
      </div>
    </div>
  );
}