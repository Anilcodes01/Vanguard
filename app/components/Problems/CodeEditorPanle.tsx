import React, { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { BsCheck2Circle } from "react-icons/bs";
import {
  ChevronUp,
  Maximize,
  Loader2,
  ChevronDown,
  X,
  Clock,
  Cpu,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { EditorHeader } from "./CodeEditor/EditorHeader";
import { mapLanguageToMonaco } from "@/lib/languageMappings";
import { SubmissionResult, ProblemStarterTemplate } from "@/types";

export const TestCaseInput = ({
  input,
  expectedOutput,
}: {
  input: string | null;
  expectedOutput: string | null;
}) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Input
        </p>
        <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm text-gray-800 border border-gray-200">
          {input || "No input"}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Expected Output
        </p>
        <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm text-gray-800 border border-gray-200">
          {expectedOutput || "No expected output"}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string;
  colorClass: string;
}

const StatCard = ({ icon: Icon, label, value, colorClass }: StatCardProps) => (
  <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg flex-1">
    <Icon className={`w-5 h-5 ${colorClass}`} />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  </div>
);

export const RenderOutput = ({
  result,
}: {
  result: SubmissionResult | null;
}) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
        <div className="text-sm">Run your code to see results</div>
      </div>
    );
  }

  const isAccepted = result.status === "Accepted";
  const isError =
    result.status === "Error" ||
    result.status === "Runtime Error" ||
    result.status === "Compilation Error";

  return (
    <div className="p-4 space-y-4 text-black overflow-y-auto h-full pb-20">
      <div className="flex items-center gap-3 mb-6">
        {isAccepted ? (
          <CheckCircle className="text-green-500" size={28} />
        ) : (
          <XCircle className="text-red-500" size={28} />
        )}
        <div>
          <h3
            className={`text-xl font-bold ${
              isAccepted ? "text-green-600" : "text-red-500"
            }`}
          >
            {result.status}
          </h3>
          {result.message && isError && (
            <p className="text-sm text-red-500 mt-1">{result.message}</p>
          )}
        </div>
      </div>

      {(result.executionTime != null || result.executionMemory != null) && (
        <div className="flex flex-wrap gap-3">
          {result.executionTime != null && (
            <StatCard
              icon={Clock}
              label="Runtime"
              value={`${(result.executionTime * 1000).toFixed(0)} ms`}
              colorClass="text-blue-500"
            />
          )}
          {result.executionMemory != null && (
            <StatCard
              icon={Cpu}
              label="Memory"
              value={`${(result.executionMemory / 1024).toFixed(2)} MB`}
              colorClass="text-purple-500"
            />
          )}
        </div>
      )}

      {}
      <div className="space-y-4 pt-2">
        {result.input && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">
              Input
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800 font-mono whitespace-pre-wrap border border-gray-200">
              {result.input}
            </pre>
          </div>
        )}

        {result.userOutput && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">
              Your Output
            </p>
            <pre
              className={`p-3 rounded-lg text-sm font-mono whitespace-pre-wrap border ${
                isAccepted
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {result.userOutput}
            </pre>
          </div>
        )}

        {result.expectedOutput && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">
              Expected Output
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800 font-mono whitespace-pre-wrap border border-gray-200">
              {result.expectedOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

type TestCaseStatus = "pending" | "running" | "passed" | "failed";

interface CodeEditorPanelProps {
  problemId: string;
  code: string;
  setCode: (code: string) => void;
  handleSubmit: (startTime: number | null) => void;
  handleRunCode: (activeCaseIndex: number) => void;
  isSubmitting: boolean;
  isCodeRunning: boolean;
  submissionResult: SubmissionResult | null;
  runResult: SubmissionResult | null;
  testCases: {
    id: string;
    input: string | null;
    expectedOutput: string | null;
    isHidden: boolean;
  }[];
  starterTemplates: ProblemStarterTemplate[];
  selectedLanguage: ProblemStarterTemplate;
  onLanguageChange: (language: ProblemStarterTemplate) => void;
  submissionProgress: number;
  testCaseStatuses: TestCaseStatus[];
  problemTitle: string;
  isMobileDetailsVisible: boolean;
  onToggleMobileDetails: () => void;
}

export default function CodeEditorPanel({
  code,
  setCode,
  handleSubmit,
  handleRunCode,
  isSubmitting,
  isCodeRunning,
  submissionResult,
  runResult,
  testCases,
  starterTemplates,
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
      setEditorHeight(containerRef.current.offsetHeight * 0.6);
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

  const getTestCaseStatusStyle = (status: TestCaseStatus) => {
    switch (status) {
      case "running":
        return "bg-gray-100 text-black border-orange-400 border";
      case "passed":
        return "bg-green-50 text-green-700 border-green-400 border";
      case "failed":
        return "bg-red-50 text-red-700 border-red-400 border";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent border";
    }
  };

  const getTestCaseStatusIcon = (status: TestCaseStatus) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />;
      case "passed":
        return <BsCheck2Circle className="h-3.5 w-3.5 text-green-500" />;
      case "failed":
        return <X className="h-3.5 w-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  const displayResult = submissionResult || runResult;
  const visibleTestCases = testCases;

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white">
      {}
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

      {}
      <div
        className="bg-gray-50 rounded-lg shadow-sm flex flex-col overflow-hidden flex-shrink-0 border border-gray-200"
        style={{ height: editorHeight ? `${editorHeight}px` : "60%" }}
      >
        <EditorHeader
          onRun={() => handleRunCode(activeCaseIndex)}
          onSubmit={() => handleSubmit(startTime)}
          isRunning={isCodeRunning && !isSubmitting}
          isSubmitting={isSubmitting}
          starterTemplates={starterTemplates}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          submissionProgress={submissionProgress}
        />

        <div className="flex-grow relative">
          <Editor
            height="100%"
            language={mapLanguageToMonaco(selectedLanguage.language)}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              readOnly: false,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              contextmenu: true,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="flex justify-between items-center px-4 py-1.5 bg-gray-100 border-t border-gray-200 text-xs text-gray-500 font-mono">
          <span>{isStarted ? `Time: ${elapsedTime}s` : "Ready"}</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      {}
      <div
        onMouseDown={handleMouseDown}
        className="w-full h-3 cursor-row-resize flex items-center justify-center group hover:bg-gray-50 -my-1.5 z-10"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-[#f59120] transition-colors duration-200"></div>
      </div>

      {}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0 overflow-hidden mt-2">
        {}
        <div className="flex items-center justify-between px-2 pt-2 border-b border-gray-200 bg-gray-50/50">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("testcase")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "testcase"
                  ? "bg-white text-black border-t border-x border-gray-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BsCheck2Circle
                className={`${
                  activeTab === "testcase" ? "text-green-500" : ""
                }`}
                size={16}
              />
              Testcases
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "result"
                  ? "bg-white text-black border-t border-x border-gray-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  displayResult
                    ? displayResult.status === "Accepted"
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></span>
              Test Result
            </button>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronUp size={18} />
            </button>
          </div>
        </div>

        {}
        <div className="flex-grow overflow-y-auto bg-white">
          {activeTab === "testcase" && (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto no-scrollbar">
                {visibleTestCases.map((tc, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCaseIndex(index)}
                    disabled={isCodeRunning}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeCaseIndex === index
                        ? "bg-gray-800 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } ${
                      testCaseStatuses[index] !== "pending"
                        ? getTestCaseStatusStyle(
                            testCaseStatuses[index]
                          ).replace("bg-gray-100", "bg-white")
                        : ""
                    }`}
                  >
                    {getTestCaseStatusIcon(testCaseStatuses[index])}
                    <span>Case {index + 1}</span>
                    {}
                  </button>
                ))}
              </div>
              <div className="flex-grow overflow-y-auto">
                <TestCaseInput
                  input={visibleTestCases[activeCaseIndex]?.input}
                  expectedOutput={
                    visibleTestCases[activeCaseIndex]?.expectedOutput
                  }
                />
              </div>
            </div>
          )}
          {activeTab === "result" && <RenderOutput result={displayResult} />}
        </div>
      </div>
    </div>
  );
}
