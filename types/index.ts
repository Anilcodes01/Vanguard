import { SolutionStatus } from '@prisma/client';

export type SubmissionResult = {
  status: string;
  message?: string;
  details?: string;
  input?: string;
  userOutput?: string;
  expectedOutput?: string;
  executionTime?: number;   
  executionMemory?: number;  
  xpEarned?: number;         
  starsEarned?: number;     
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
  testCases: TestCase[];
  topic: string[];
  solutionStatus?: 'Solved' | 'Attempted' | null;
};




export type RewardData = {
  xpEarned: number;
  starsEarned: number;
};



export type ProfileData = {
  name: string | null;
  college_name: string | null;
  avatar_url: string | null;
  username: string | null;
  domain: string | null;
  xp: number;
  stars: number;
};


export type Submission = {
  id: string;
  status: string;
  createdAt: string;
  problem: { title: string };
};


export type ProblemSolution = {
  status: "Solved" | "Attempted";
};


export type UserData = {
  email: string | null;
  profiles: ProfileData[];
  submissions: Submission[];
  problemSolutions: ProblemSolution[];
};