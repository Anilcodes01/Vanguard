export interface Profile {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface ProjectData {
  id: string;
  title: string;
  customTitle: string | null;
  description: string;
  shortDescription: string | null;
  overview: string | null;
  tags: string[];
  githubLink: string | null;
  liveLink: string | null;
  screenshots: string[];
  createdAt: Date;
  internshipWeek: {
    user: {
      profiles: Profile[];
    };
  };
}
