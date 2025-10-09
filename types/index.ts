export type SubmissionResult = {
  status: "Accepted" | "Wrong Answer" | "Error" | string;
  message?: string;
  details?: string;
  input?: string;
  userOutput?: string;
  expectedOutput?: string;
};

export type TestCase = {
  id: number;
  input: string | null;
  expected: string | null;
};

export interface CodeEditorPanelProps {
  problemId: string;
  code: string;
  maxTimeInMinutes: number;
  setCode: (code: string) => void;
  handleSubmit: (startTime: number | null) => void;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  testCases: TestCase[];
}



export type Example = {
  id: number;
  input: string;
  output: string;
  
};


export type ProblemDetails = {
  id: string;
  slug: string;
  title: string;
   maxTime: number; 
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
   starterCode: string;
  examples: Example[];
   topic: string[];
    testCases: TestCase[];
};




export type RewardData = {
  xpEarned: number;
  starsEarned: number;
};
