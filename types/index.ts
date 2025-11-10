import { FormEvent, ChangeEvent } from "react";

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

export interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  avatar_url: string | null;
  xp: number;
  league: string;
  stars: number;
}

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

export interface ProblemLanguageDetail {
  id: string;
  problemId: string;
  language: string;
  languageId: number;
  starterCode: string;
  driverCodeTemplate?: string | null;
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
  solutionStatus?: "Solved" | "Attempted" | null;
  problemLanguageDetails: ProblemLanguageDetail[];
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
  league: string;
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

export type League =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Sapphire"
  | "Ruby"
  | "Emerald"
  | "Amethyst"
  | "Pearl"
  | "Obsidian"
  | "Diamond";

export interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  onboarded: boolean;
  xp: number;
  stars: number;
  domain: string | null;
  college_name: string | null;
  year_of_study: string | null;
  primary_field: string | null;
  comfort_level: string | null;
  preferred_langs: string[];
  platform_exp: string | null;
  main_goal: string[];
  challenge_pref: string[];
  motivation: string[];
  time_dedication: string | null;
  internship_interest: string | null;
  role_interest: string[];
  project_pref: string | null;
  playstyle: string | null;
  first_badge: string | null;
  league: League;
}

export interface SubmittedProject {
  id: string;
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
  project: {
    name: string;
  };
}
export interface UserData {
  profiles: Profile[];
  submissions: Submission[];
  problemSolutions: ProblemSolution[];
  submittedProjects: SubmittedProject[];
}

export type LeaderboardMember = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  weeklyXP: number;
  league: string;
};

export type LeaderboardData = {
  group: {
    id: string;
    league: string;
    members: LeaderboardMember[];
  } | null;
  currentUserRank: number;
};

export type DailyProblem = {
  id: string;
  slug: string | null;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  maxTime: number;
  topic: string[];
};

export type User = {
  profiles: Profile[];
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: User;

  parentId: string | null;
  replies?: Comment[];
    likesCount: number; 
  hasLiked: boolean; 
};

export type Project = {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
};

export type ProjectSubmission = {
  id: string;
  name: string;
  short_description: string | null;
  coverImage: string | null;
  description: string | null;
  builtWith: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  createdAt: string;
  user: User;
  project: Project;
  comments: Comment[];
  upvotesCount: number;
  hasUpvoted: boolean;
  commentsCount: number;
  screenshots: string[];
  hasBookmarked: boolean;
  bookmarksCount: number;
};


export interface InProgressProject {
  id: string;
  name: string;
  description: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  startedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  weeklyXP: number;
}

export type SubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (e: FormEvent) => void;
  description: string;
  name: string
  setName: (value: string) => void;
  shortDescription: string;
  setShortDescription: (value: string) => void
  setDescription: (value: string) => void;
  builtWith: string;
  setBuiltWith: (value: string) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
  liveUrl: string;
  setLiveUrl: (value: string) => void;
  handleCoverImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleScreenshotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  submissionStatus: {
    message: string | null;
    type: "success" | "error" | null;
  };
  onRemoveCoverImage: () => void;
  onRemoveScreenshot: (index: number) => void;
  coverImageFile: File | null;
  screenshotFiles: File[];
};

export type SubmissionFormProps = {
  handleSubmit: (e: FormEvent) => void;
  description: string;
  setDescription: (value: string) => void;
  builtWith: string;
  setBuiltWith: (value: string) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
  liveUrl: string;
  setLiveUrl: (value: string) => void;
  handleCoverImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleScreenshotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCoverImage: () => void;
  onRemoveScreenshot: (index: number) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  submissionStatus: {
    message: string | null;
    type: "success" | "error" | null;
  };
  coverImageFile: File | null;
  screenshotFiles: File[];
  name: string;
  setName: (value: string) => void,
  shortDescription: string,
  setShortDescription: (value: string) => void,
};

export type SubmissionStatus = {
  message: string | null;
  type: "success" | "error" | null;
};

export type ProjectStatus =
  | "Loading"
  | "NotStarted"
  | "InProgress"
  | "Submitted"
  | "Expired";

export type ProjectDataResponse = {
  project: Project;
  status: ProjectStatus;
  startedAt?: string;
  completionCount: number;
};


export type ExploreUser = {
  name: string | null;
  avatar_url: string | null;
};


type SubmittedProjectInfo = {
  coverImage: string | null; 
  user: {
    profiles: ExploreUser[] | null;
  };
  _count: {
    upvotes: number;
    comments: number;
  };
};

export type ExploreProject = {
  id: string;
  name: string;
  description: string;
  domain: string;
  coverImage: string | null;
  SubmittedProjects: SubmittedProjectInfo[];
};

export type ProjectSidebarProps = {
  project: Project;
  projectStatus:
    | "Loading"
    | "NotStarted"
    | "InProgress"
    | "Submitted"
    | "Expired";
  timeLeft: string;
  isStarting: boolean;
  handleStartProject: () => void;
  handleOpenSubmitModal: () => void;
};