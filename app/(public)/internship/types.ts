export interface InternshipProblem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface WalkthroughCardData {
  id: string;
  cardType: string;
  title: string;
  content: string;
}

export interface InternshipWeekData {
  id: string;
  weekNumber: number;
  title: string;
  topics: string[];
  description: string;
  projects: InternshipProject[];
  problems: InternshipProblem[];
  walkthroughs: WalkthroughCardData[];
}

export interface InternshipProject {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  githubLink?: string | null;
  liveLink?: string | null;

  aiReviewStatus?: "PENDING" | "COMPLETED" | "FAILED";
  aiScore?: number | null;
  aiFeedback?: string | null;
  aiImprovements?: string[];
  reviewAvailableAt?: string | Date | null;
}
