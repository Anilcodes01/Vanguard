export interface InternshipProblem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface InternshipProject {
  id: string;
  title: string;
  description: string;
  githubLink?: string;
  liveLink?: string;
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
