"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";

import ProblemDetailsPanel from "@/app/components/Problems/ProblemsDetailsPanle";
import { SuccessModal } from "@/app/components/Problems/CodeEditor/SuccessModal";
import {
  SubmissionResult,
  ProblemLanguageDetail,
  ProblemDetails,
  ProblemStarterTemplate,
} from "@/types";

const DynamicCodeEditorPanel = dynamic(
  () => import("@/app/components/Problems/CodeEditorPanle"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
        Loading Editor...
      </div>
    ),
    ssr: false,
  }
);

interface FullInternshipData {
  algoData: {
    language: string;
    languageId: number;
    starterCode: string;
    testStrategy: string;
    problem: {
      id: string;
      title: string;
      description: string;
      topics?: string[];
    };
  };
  examples: { id: string; input: string; output: string }[];
  testCases: { id: string; input: string; expected: string }[];
}

export default function IndividualInternshipProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;
  const router = useRouter();

  const [data, setData] = useState<FullInternshipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string>("");
  const [isMobileDetailsVisible, setIsMobileDetailsVisible] = useState(false);

  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [testCaseStatuses, setTestCaseStatuses] = useState<
    ("pending" | "running" | "passed" | "failed")[]
  >([]);

  const [showSuccess, setShowSuccess] = useState(false);

  const hasFetched = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current || !problemId) return;
      hasFetched.current = true;

      try {
        setIsLoading(true);
        const res = await axios.post(
          "/api/internship/generateInternshipProblemsData",
          {
            problemId,
          }
        );

        const jsonData = res.data.data;
        setData(jsonData);

        if (jsonData.algoData?.starterCode) {
          setCode(jsonData.algoData.starterCode);
        }

        if (jsonData.testCases) {
          setTestCaseStatuses(
            new Array(jsonData.testCases.length).fill("pending")
          );
        }
      } catch (err: unknown) {
        console.error("Error fetching problem:", err);
        let errMsg = "Failed to load problem";
        if (axios.isAxiosError(err)) {
          errMsg = err.response?.data?.error || err.message;
        } else if (err instanceof Error) {
          errMsg = err.message;
        }
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [problemId]);

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleRunCode = async (activeCaseIndex: number) => {
    if (!data) return;

    setRunResult(null);
    setSubmissionResult(null);

    const newStatuses = [...testCaseStatuses];
    newStatuses[activeCaseIndex] = "running";
    setTestCaseStatuses(newStatuses);

    const targetCase = data.examples[activeCaseIndex] || data.examples[0];

    if (!targetCase) return;

    try {
      const res = await axios.post("/api/internship/problem/run", {
        problemId: data.algoData.problem.id,
        code,
        input: targetCase.input,
        expectedOutput: targetCase.output,
        languageId: data.algoData.languageId,
      });

      setRunResult(res.data);

      const finalStatus = res.data.status === "Accepted" ? "passed" : "failed";
      const finalStatuses = [...newStatuses];
      finalStatuses[activeCaseIndex] = finalStatus;
      setTestCaseStatuses(finalStatuses);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Execution Failed";
      setRunResult({ status: "Error", message: msg });
      const finalStatuses = [...newStatuses];
      finalStatuses[activeCaseIndex] = "failed";
      setTestCaseStatuses(finalStatuses);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;

    setIsSubmitting(true);
    setSubmissionResult(null);
    setRunResult(null);
    clearProgressInterval();

    setTestCaseStatuses(new Array(data.testCases.length).fill("pending"));
    setSubmissionProgress(0);

    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 90) currentProgress = 90;
      setSubmissionProgress(currentProgress);
    }, 200);

    try {
      let allPassed = true;

      for (let i = 0; i < data.testCases.length; i++) {
        const testCase = data.testCases[i];

        setTestCaseStatuses((prev) => {
          const s = [...prev];
          s[i] = "running";
          return s;
        });

        const res = await axios.post("/api/internship/problem/run", {
          problemId: data.algoData.problem.id,
          code,
          input: testCase.input,
          expectedOutput: testCase.expected,
          languageId: data.algoData.languageId,
        });

        const passed = res.data.status === "Accepted";
        if (!passed) allPassed = false;

        setTestCaseStatuses((prev) => {
          const s = [...prev];
          s[i] = passed ? "passed" : "failed";
          return s;
        });
      }

      clearProgressInterval();
      setSubmissionProgress(100);

      const finalResult: SubmissionResult = {
        status: allPassed ? "Accepted" : "Wrong Answer",
        message: allPassed
          ? "All test cases passed!"
          : "Some test cases failed.",
      };

      setSubmissionResult(finalResult);

      if (allPassed) {
        setShowSuccess(true);
      }
    } catch (error) {
      clearProgressInterval();
      setSubmissionResult({ status: "Error", message: "Submission Error" });
      setSubmissionProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mappedStarterTemplate: ProblemStarterTemplate | null = data
    ? {
        id: "generated-id",
        language: data.algoData.language,
        code: data.algoData.starterCode,
      }
    : null;

  const mappedProblemDetails: ProblemDetails | null =
    data && mappedStarterTemplate
      ? {
          id: data.algoData.problem.id,
          title: data.algoData.problem.title,
          description: data.algoData.problem.description,
          slug: data.algoData.problem.id,
          difficulty: "MEDIUM",
          tags: data.algoData.problem.topics || ["Internship"],
          acceptanceRate: 0,
          starterTemplates: [mappedStarterTemplate],
          testCases: data.testCases.map((tc, i) => ({
            id: i.toString(),
            input: tc.input,
            expectedOutput: tc.expected,
            isHidden: false,
          })),
          solutionStatus: "Attempted",
        }
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">
          Preparing Coding Environment...
        </p>
      </div>
    );
  }

  if (error || !data || !mappedProblemDetails || !mappedStarterTemplate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">
            Unable to load problem
          </h2>
          <p className="text-gray-500 mt-2 mb-6">{error || "Data missing"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCodeRunning = testCaseStatuses.includes("running") || isSubmitting;

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen p-2 gap-2 text-black lg:overflow-hidden bg-white">
      {/* Problem Details Panel */}
      <div
        className={`lg:w-1/2 lg:block ${
          isMobileDetailsVisible ? "block" : "hidden"
        }`}
      >
        <ProblemDetailsPanel problem={mappedProblemDetails} />
      </div>

      {/* Code Editor Panel */}
      <div className="w-full lg:w-1/2 flex-grow">
        <DynamicCodeEditorPanel
          problemId={mappedProblemDetails.id}
          code={code}
          setCode={setCode}
          handleSubmit={handleSubmit}
          handleRunCode={handleRunCode}
          isSubmitting={isSubmitting}
          isCodeRunning={isCodeRunning}
          submissionResult={submissionResult}
          runResult={runResult}
          testCases={data.examples.map((ex, i) => ({
            id: i.toString(),
            input: ex.input,
            expectedOutput: ex.output,
            isHidden: false,
          }))}
          starterTemplates={mappedProblemDetails.starterTemplates}
          selectedLanguage={mappedStarterTemplate}
          onLanguageChange={() => {}}
          submissionProgress={submissionProgress}
          testCaseStatuses={testCaseStatuses}
          problemTitle={mappedProblemDetails.title}
          isMobileDetailsVisible={isMobileDetailsVisible}
          onToggleMobileDetails={() =>
            setIsMobileDetailsVisible(!isMobileDetailsVisible)
          }
        />
      </div>

      {}
      {showSuccess && (
        <SuccessModal
          xp={50}
          stars={10}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
