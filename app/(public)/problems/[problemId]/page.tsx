"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import ProblemDetailsPanel from "@/app/components/Problems/ProblemsDetailsPanle";
import { problemSolved } from "@/app/store/actions";
import { SuccessModal } from "@/app/components/Problems/CodeEditor/SuccessModal";
import {
  ProblemDetails,
  SubmissionResult,
  RewardData,
  ProblemLanguageDetail,
} from "@/types";
import { LoadingSpinner } from "@/app/components/Profile/ProfilePanel";
import dynamic from "next/dynamic";

const DynamicCodeEditorPanel = dynamic(
  () => import("@/app/components/Problems/CodeEditorPanle"),
  {
    loading: () => <div className="editor-skeleton">Loading Editor...</div>,
    ssr: false,
  }
);
type TestCaseStatus = "pending" | "running" | "passed" | "failed";
type TestCaseResultItem = {
  status: string;
  testCaseId: string;
};

export default function ProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;
  const dispatch: AppDispatch = useDispatch();

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<ProblemLanguageDetail | null>(null);
  const [code, setCode] = useState<string>("");

  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [testCaseStatuses, setTestCaseStatuses] = useState<TestCaseStatus[]>(
    []
  );
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileDetailsVisible, setIsMobileDetailsVisible] = useState(false);

  const toggleMobileDetails = () => {
    setIsMobileDetailsVisible((prev) => !prev);
  };

  const isCodeRunning = testCaseStatuses.includes("running") || isSubmitting;

  useEffect(() => {
    if (problem) {
      setTestCaseStatuses(new Array(problem.testCases.length).fill("pending"));
    }
  }, [problem]);

  useEffect(() => {
    if (!problemId) {
      setIsLoading(false);
      return;
    }
    const fetchProblem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ProblemDetails>(
          `/api/problems/${problemId}`
        );
        setProblem(response.data);
        if (response.data.problemLanguageDetails?.length > 0) {
          const lang = response.data.problemLanguageDetails[0];
          setSelectedLanguage(lang);
          setCode(lang.starterCode);
        }
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Failed to fetch problem"
            : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (selectedLanguage) {
      setCode(selectedLanguage.starterCode);
    }
  }, [selectedLanguage]);

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleRunCode = async (activeCaseIndex: number) => {
    if (!problem || !selectedLanguage) return;

    setRunResult(null);
    setSubmissionResult(null);

    const newStatuses = new Array(problem.testCases.length).fill(
      "pending"
    ) as TestCaseStatus[];
    newStatuses[activeCaseIndex] = "running";
    setTestCaseStatuses(newStatuses);

    const currentTestCase = problem.testCases[activeCaseIndex];
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
      const finalStatuses = [...newStatuses];
      finalStatuses[activeCaseIndex] =
        response.data.status === "Accepted" ? "passed" : "failed";
      setTestCaseStatuses(finalStatuses);
    } catch {
      setRunResult({
        status: "Error",
        message: "Failed to connect to the server.",
      });
      const finalStatuses = [...newStatuses];
      finalStatuses[activeCaseIndex] = "failed";
      setTestCaseStatuses(finalStatuses);
    }
  };

  const handleSubmit = async (startTime: number | null) => {
    if (!startTime || !problem || !selectedLanguage) {
      alert("Please click 'Start' before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setRunResult(null);
    clearProgressInterval();
    setTestCaseStatuses(new Array(problem.testCases.length).fill("pending"));
    setSubmissionProgress(0);

    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 95) currentProgress = 95;
      setSubmissionProgress(currentProgress);

      const newStatuses = new Array(problem.testCases.length).fill(
        "pending"
      ) as TestCaseStatus[];
      const runningIndex = Math.floor(
        (currentProgress / 100) * problem.testCases.length
      );

      for (let i = 0; i < runningIndex; i++) newStatuses[i] = "passed";

      if (runningIndex < newStatuses.length) {
        newStatuses[runningIndex] = "running";
      }

      setTestCaseStatuses(newStatuses);
    }, 150);

    try {
      const response = await axios.post("/api/submissions/batch", {
        problemId,
        code,
        startTime,
        languageId: selectedLanguage.languageId,
      });
      clearProgressInterval();
      setSubmissionResult(response.data);

      if (
        response.data.testCaseResults &&
        Array.isArray(response.data.testCaseResults)
      ) {
        const finalStatuses = new Array(problem.testCases.length).fill(
          "pending"
        );
        response.data.testCaseResults.forEach(
          (result: TestCaseResultItem, index: number) => {
            finalStatuses[index] =
              result.status === "Accepted" ? "passed" : "failed";
          }
        );
        const lastResultIndex = response.data.testCaseResults.length - 1;
        if (
          response.data.status !== "Accepted" &&
          lastResultIndex < finalStatuses.length - 1
        ) {
          finalStatuses[lastResultIndex] = "failed";
        }
        setTestCaseStatuses(finalStatuses);
      }

      if (response.data.status === "Accepted") {
        setSubmissionProgress(100);
        setTestCaseStatuses(new Array(problem.testCases.length).fill("passed"));
        setRewardData({
          xpEarned: response.data.xpEarned,
          starsEarned: response.data.starsEarned,
        });
        dispatch(
          problemSolved({
            xpEarned: response.data.xpEarned,
            starsEarned: response.data.starsEarned,
          })
        );
      } else {
        setSubmissionProgress(0);
      }
    } catch (err) {
      clearProgressInterval();
      const message = axios.isAxiosError(err)
        ? err.response?.data.message || "Failed to submit."
        : "An unknown error occurred.";
      setSubmissionResult({ status: "Error", message });
      setSubmissionProgress(0);
      const errorStatuses = new Array(problem.testCases.length).fill("pending");
      if (errorStatuses.length > 0) errorStatuses[0] = "failed";
      setTestCaseStatuses(errorStatuses);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <div className="flex justify-center items-center bg-white h-screen text-red-500">
        Error: {error}
      </div>
    );
  }
  if (!problem || !selectedLanguage) {
    return (
      <div className="flex justify-center items-center bg-white h-screen">
        Problem not found or configured correctly.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen p-2 gap-2 text-black lg:overflow-hidden bg-white">
      <div
        className={`
        lg:w-1/2 lg:block
        ${isMobileDetailsVisible ? "block" : "hidden"}
      `}
      >
        <ProblemDetailsPanel problem={problem} />
      </div>

      <div className="w-full lg:w-1/2  flex-grow">
        <DynamicCodeEditorPanel
          problemId={problem.id}
          maxTimeInMinutes={problem.maxTime}
          code={code}
          setCode={setCode}
          handleSubmit={handleSubmit}
          handleRunCode={handleRunCode}
          isSubmitting={isSubmitting}
          isCodeRunning={isCodeRunning}
          submissionResult={submissionResult}
          runResult={runResult}
          testCases={problem.testCases || []}
          availableLanguages={problem.problemLanguageDetails}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          submissionProgress={submissionProgress}
          testCaseStatuses={testCaseStatuses}
          problemTitle={problem.title}
          isMobileDetailsVisible={isMobileDetailsVisible}
          onToggleMobileDetails={toggleMobileDetails}
        />
      </div>

      {rewardData && (
        <SuccessModal
          xp={rewardData.xpEarned}
          stars={rewardData.starsEarned}
          onClose={() => setRewardData(null)}
        />
      )}
    </div>
  );
}