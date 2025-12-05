export interface InternshipProblem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
   originalProblemId?: string;
}

export interface WalkthroughCardData {
  id: string;
  cardType: string;
  title: string;
  content: string;
  internshipWeekId: string;
  createdAt: Date;
  updatedAt: Date;
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

export const CARD_ORDER = [
  "case_study",
  "problem_definition",
  "objective",
  "prerequisites",
  "deliverables",
  "rules",
  "action_plan",
];

 export interface NoteEntry {
  id: string;
  content: string;
  internshipProblemId?: string | null;
  internshipProjectId?: string | null;
}

export interface ProjectBannerProps {
  project: InternshipProject;
  showSpecs: boolean;
  onToggle: () => void;
  onOpenSubmitModal: () => void;
  weekCreatedAt?: string | Date;
  timerStartDate?: string | Date; 
  weekNumber?: number;
  journalCount: number;
  problemsCompleted: number;
  problemsTotal: number;
  interactionsCount: number;
}

export interface InternshipProject {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  githubLink?: string | null;
  liveLink?: string | null;
 startedAt?: string | Date | null;
  aiReviewStatus?: "PENDING" | "COMPLETED" | "FAILED";
  aiScore?: number | null;
  aiFeedback?: string | null;
  aiImprovements?: string[];
  reviewAvailableAt?: string | Date | null;
}
