"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProblemDetailsPanel from "@/app/components/Problems/ProblemsDetailsPanle";
import CodeEditorPanel from "@/app/components/Problems/CodeEditorPanle";
import { useUser } from "@/app/context/userContext";
import { SuccessModal } from "@/app/components/Problems/CodeEditor/SuccessModal";
import { ProblemDetails, SubmissionResult, RewardData } from "@/types";


export default function ProblemPage() {
  const params = useParams();
  const problemId = params.problemId as string;
   const { addXp } = useUser(); 

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string>("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

   const [rewardData, setRewardData] = useState<RewardData | null>(null);

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

        setCode(response.data.starterCode); 
        
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

 const handleSubmit = async (startTime: number | null) => {
    if (!startTime) {
        alert("Please click 'Start' before submitting.");
        return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const response = await axios.post("/api/submissions", {
        problemId,
        code,
        startTime, 
      });

      setSubmissionResult(response.data);

      if (response.data.status === 'Accepted' && response.data.xpEarned > 0) {
        addXp(response.data.xpEarned);
        setRewardData({
          xpEarned: response.data.xpEarned,
          starsEarned: response.data.starsEarned,
        });
      }

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
     <div className="flex h-screen p- gap-2 text-black overflow-hidden bg-[#262626]">
      <ProblemDetailsPanel problem={problem} />
        <CodeEditorPanel
        problemId={problem.id} 
        maxTimeInMinutes={problem.maxTime}
        code={code} 
        setCode={setCode}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submissionResult={submissionResult}
        testCases={problem.testCases}
      />
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