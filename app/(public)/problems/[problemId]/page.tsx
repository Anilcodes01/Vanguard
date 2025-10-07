"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProblemDetailsPanel from "@/app/components/Problems/ProblemsDetailsPanle";
import CodeEditorPanel from "@/app/components/Problems/CodeEditorPanle";

type Example = {
  id: number;
  input: string;
  output: string;
  
};

type TestCase = {
  id: number;
  input: string | null;
   expected: string | null; 
};

type ProblemDetails = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  starter_code: string;
  examples: Example[];
   topic: string[];
    testCases: TestCase[];
};

type SubmissionResult = {
  status: "Accepted" | "Wrong Answer" | "Error";
  message?: string;
  details?: string;
  input?: string;
  userOutput?: string;
  expectedOutput?: string;
};

export default function ProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string>("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!problemId) {
      setIsLoading(false);
      return;
    }

    const fetchProblem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ProblemDetails>(`/api/problems/${problemId}`);
        setProblem(response.data);
        setCode(response.data.starter_code);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch problem data.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const response = await axios.post("/api/submissions", {
        problemId,
        code,
      });
      setSubmissionResult(response.data);
    } catch (err) {
      let message = "An unknown error occurred during submission.";
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.message || err.response.data.error || "Failed to submit.";
      }
      setSubmissionResult({ status: "Error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Problem...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }
  if (!problem) {
    return <div className="flex justify-center items-center h-screen">Problem not found.</div>;
  }

  return (
     <div className="flex h-screen p- gap-2 text-black overflow-hidden bg-black">
      <ProblemDetailsPanel problem={problem} />
     <CodeEditorPanel
        problemId={problem.id} 
        code={code}
        setCode={setCode}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submissionResult={submissionResult}
        testCases={problem.testCases}
      />
    </div>
  );
}