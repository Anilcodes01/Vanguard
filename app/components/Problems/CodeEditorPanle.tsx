import React, { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { BsCheck2Circle } from "react-icons/bs";
import { ChevronUp, Maximize, Plus } from "lucide-react";
import axios from "axios";
import { EditorHeader } from "./CodeEditor/EditorHeader";
import { RenderOutput } from "./CodeEditor/RenderOutput";
import { TestCaseInput } from "./CodeEditor/TestCaseInput";
import { mapLanguageToMonaco } from "@/lib/languageMappings";
import { SubmissionResult, ProblemLanguageDetail } from "@/types";

interface CodeEditorPanelProps {
  problemId: string;
  code: string;
  maxTimeInMinutes: number;
  setCode: (code: string) => void;
  handleSubmit: (startTime: number | null) => void;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  testCases: { id: number, input: string | null, expected: string | null }[];
  availableLanguages: ProblemLanguageDetail[];
  selectedLanguage: ProblemLanguageDetail;
  onLanguageChange: (language: ProblemLanguageDetail) => void;
}

export default function CodeEditorPanel({
  problemId,
  code,
  maxTimeInMinutes,
  setCode,
  handleSubmit,
  isSubmitting,
  submissionResult,
  testCases,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
}: CodeEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);
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
      setEditorHeight(containerRef.current.offsetHeight * 0.80);
    }
  }, [containerRef.current]);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const newHeight = e.clientY - containerTop;
      
      const minHeight = 300;
      const bottomPanelMinHeight = 156;
      const resizerHeight = 8;
      const maxHeight = containerRef.current.offsetHeight - bottomPanelMinHeight - resizerHeight;

      if (newHeight > minHeight && newHeight < maxHeight) {
        setEditorHeight(newHeight);
      }
    }
  }, [isResizing]);

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
    if (!isStarted || !startTime || submissionResult?.status === 'Accepted') {
      return;
    }

    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isStarted, startTime, submissionResult]);

  const formatTime = (elapsedSeconds: number): string => {
    if (elapsedSeconds <= maxTimeInSeconds) {
      const remainingSeconds = maxTimeInSeconds - elapsedSeconds;
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    } else {
      const extraSeconds = elapsedSeconds - maxTimeInSeconds;
      const min = Math.floor(extraSeconds / 60);
      const sec = extraSeconds % 60;
      return `+${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
  };

  const getTimerColor = (elapsedSeconds: number): string => {
    if (elapsedSeconds > maxTimeInSeconds) {
      return 'text-red-500';
    }
    const remainingSeconds = maxTimeInSeconds - elapsedSeconds;
    if (remainingSeconds <= 60) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  const handleRun = async () => {
    if (!isStarted) return;
    setIsRunning(true);
    setRunResult(null);
    const currentTestCase = testCases[activeCaseIndex];
    if (!currentTestCase) return;

    try {
      const response = await axios.post("/api/run", {
        problemId,
        code,
        input: currentTestCase.input,
        expectedOutput: currentTestCase.expected,
        languageId: selectedLanguage.languageId,
      });
      setRunResult(response.data);
    } catch {
      setRunResult({ status: "Error", message: "Failed to connect to the server." });
    } finally {
      setIsRunning(false);
      setActiveTab("result");
    }
  };

  const displayResult = submissionResult || runResult;

  return (
    <div ref={containerRef} className="w-1/2 flex flex-col h-full">
      <div 
        className="bg-zinc-900 rounded-lg shadow-2xl flex flex-col overflow-hidden flex-shrink-0"
        style={{ height: editorHeight ? `${editorHeight}px` : '60%' }}
      >
        <EditorHeader
          onStart={handleStart}
          onRun={handleRun}
          onSubmit={() => handleSubmit(startTime)}
          isStarted={isStarted}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          displayTime={formatTime(elapsedTime)}
          timerColor={getTimerColor(elapsedTime)}
          availableLanguages={availableLanguages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />

        <div className="flex-grow relative">
          {!isStarted && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-300 font-semibold">Editor is locked.</p>
                <p className="text-gray-400 text-sm">Click &quot;Start&quot; to begin coding.</p>
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
        <div className="flex justify-between items-center px-4 py-1 bg-zinc-800 border-t border-zinc-700 text-xs text-gray-400">
          <span>{isStarted ? "In Progress" : "Not Started"}</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
      
      <div
        onMouseDown={handleMouseDown}
        className="w-full h-2 cursor-row-resize flex items-center justify-center group"
      >
        <div className="w-full h-[3px] bg-transparent group-hover:bg-sky-500/50 transition-colors duration-200"></div>
      </div>

      <div className="flex-1 bg-[#262626] rounded-lg shadow-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
          <div className="flex items-center gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab("testcase")}
              className={`flex items-center gap-2 p-1 rounded-md ${
                activeTab === "testcase" ? "text-white" : "text-gray-400"
              }`}
            >
              <BsCheck2Circle
                className={`${
                  activeTab === "testcase" ? "text-green-400" : ""
                }`}
              />
              Testcase
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => setActiveTab("result")}
              className={`p-1 rounded-md ${
                activeTab === "result" ? "text-white" : "text-gray-400"
              }`}
            >
              Test Result
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="hover:text-white">
              <Maximize size={16} />
            </button>
            <button className="hover:text-white">
              <ChevronUp size={20} />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {activeTab === "testcase" && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-2">
                {testCases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCaseIndex(index)}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      activeCaseIndex === index
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                    }`}
                  >
                    Case {index + 1}
                  </button>
                ))}
                <button className="p-1.5 rounded-lg bg-zinc-800 text-gray-400 hover:bg-zinc-700">
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