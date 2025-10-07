import React, { useState } from "react";
import Editor from "@monaco-editor/react";

import { VscCode } from "react-icons/vsc";
import { BsCheck2Circle } from "react-icons/bs";
import { ChevronUp, Maximize, PlayIcon, Plus } from "lucide-react";
import axios from "axios";

type SubmissionResult = {
  status: "Accepted" | "Wrong Answer" | "Error" | string;
  message?: string;
  details?: string;
  input?: string;
  userOutput?: string;
  expectedOutput?: string;
};

type TestCase = {
  id: number;
  input: string | null;
  expected: string | null;
};

interface CodeEditorPanelProps {
  problemId: string;
  code: string;
  setCode: (code: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  testCases: TestCase[];
}

const EditorHeader = ({
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}: {
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
    <div className="flex items-center gap-4">
      <div className="flex gap-2 items-center text-white">
        <VscCode className="text-gray-400" />
        <span className="font-bold rounded-lg bg-gray-700 px-4 ">Code</span>
      </div>
      <span className="text-sm font-medium text-gray-200">JavaScript</span>
    </div>
    <div className="flex items-center gap-4">
      <button
        onClick={onRun}
        disabled={isRunning || isSubmitting}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 text-white text-sm font-semibold rounded-lg hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-gray-500 transition-colors"
      >
        <PlayIcon size={14} />
        {isRunning ? "Running..." : "Run"}
      </button>
      <button
        onClick={onSubmit}
        disabled={isRunning || isSubmitting}
        className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  </div>
);

const RenderOutput = ({ result }: { result: SubmissionResult | null }) => {
  if (!result) {
    return (
      <div className="p-4">
        <pre className="text-gray-400">
          Run or submit your code to see the result.
        </pre>
      </div>
    );
  }

  if (result.status === "Accepted") {
    return <div className="p-4 text-green-400 font-bold">✅ Accepted!</div>;
  }

  return (
    <div className="p-4 text-sm font-mono">
      <p className="font-bold text-red-400">❌ {result.status}</p>
      {result.details && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="font-semibold text-gray-300 mb-1">Error Details:</p>
          <pre className="whitespace-pre-wrap text-red-300">
            {result.details}
          </pre>
        </div>
      )}
      {result.input !== undefined && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg space-y-3">
          <div>
            <p className="font-semibold text-gray-300">Input:</p>
            <pre className="whitespace-pre-wrap text-gray-200">
              {result.input}
            </pre>
          </div>
          <div>
            <p className="font-semibold text-gray-300">Your Output:</p>
            <pre className="whitespace-pre-wrap text-red-300">
              {result.userOutput || '""'}
            </pre>
          </div>
          <div>
            <p className="font-semibold text-gray-300">Expected:</p>
            <pre className="whitespace-pre-wrap text-green-300">
              {result.expectedOutput || '""'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const TestCaseInput = ({ input }: { input: string | null }) => {
  if (!input)
    return (
      <div className="p-4 text-gray-500">No input for this test case.</div>
    );

  let formattedInput: { key: string; value: string } | null = null;
  try {
    const parsed = JSON.parse(input);
    const key = Object.keys(parsed)[0];
    const value = JSON.stringify(parsed[key]);
    formattedInput = { key, value };
  } catch (e) {
    const parts = input.split("=");
    if (parts.length === 2) {
      formattedInput = { key: parts[0].trim(), value: parts[1].trim() };
    }
  }

  if (!formattedInput) {
    return <pre className="p-4 text-white font-mono">{input}</pre>;
  }

  return (
    <div className="p-4 text-white font-mono text-sm space-y-2">
      <p className="text-gray-400">{formattedInput.key} =</p>
      <div className="bg-zinc-800 rounded-lg p-3">{formattedInput.value}</div>
    </div>
  );
};

export default function CodeEditorPanel({
  problemId,
  code,
  setCode,
  handleSubmit,
  isSubmitting,
  submissionResult,
  testCases,
}: CodeEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);

  const handleRun = async () => {
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
      });
      setRunResult(response.data);
    } catch (error) {
      setRunResult({
        status: "Error",
        message: "Failed to connect to the server.",
      });
    } finally {
      setIsRunning(false);
      setActiveTab("result");
    }
  };

  const displayResult = submissionResult || runResult;

  return (
    <div className="w-1/2 flex flex-col p- gap-4 ">
      <div className="bg-zinc-900 rounded-lg shadow-2xl flex flex-col flex-grow overflow-hidden">
        <EditorHeader
          onRun={handleRun}
          onSubmit={handleSubmit}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />

        <div className="flex-grow relative">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 10 },
            }}
          />
        </div>
        <div className="flex justify-between items-center px-4 py-1 bg-zinc-800 border-t border-zinc-700 text-xs text-gray-400">
          <span>Saved</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      <div className="flex-shrink-0 bg-[#262626] rounded-lg shadow-2xl flex flex-col min-h-[16rem]">
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

        <div className="flex-grow">
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
