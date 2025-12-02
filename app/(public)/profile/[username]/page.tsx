import {
  ProfilePanel,
  ErrorDisplay,
} from "@/app/components/Profile/ProfilePanel";
import ActivityTabs from "@/app/components/Profile/ActivityTab";
import ProblemSolvingOverview from "@/app/components/Profile/ProblemSolvingOverview";
import { getProfileData } from "@/app/lib/data/profile";
import { ProfileData } from "@/types";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const data = await getProfileData(decodedUsername);

  if (!data || !data.profile) {
    return <ErrorDisplay message="This user profile could not be found." />;
  }

  const {
    profile,
    submissions,
    totalSubmissionsCount,
    submittedProjects,
    internshipProjects,
    totalProjectsCount,
    totalInternshipProjectsCount,
    difficultyStats,
  } = data;

  const combinedTotalProjects =
    totalProjectsCount + (totalInternshipProjectsCount || 0);

  const profileForPanel = {
    ...profile,
    league: (profile as ProfileData).league
      ? String((profile as ProfileData).league)
      : "Unranked",
  };

  const formattedSubmissions = submissions.map((s) => ({
    id: s.id,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    problem: {
      title: s.problem.title,
      difficulty: s.problem.difficulty,
    },
  }));

  const formattedStandalone = submittedProjects.map((p) => ({
    id: p.id,
    title: p.project.name,
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    createdAt: p.createdAt.toISOString(),
    type: "Personal" as const,
  }));

  const formattedInternship = (internshipProjects || []).map((p) => ({
    id: p.id,
    title: `Week ${p.internshipWeek.weekNumber}: ${p.internshipWeek.title}`,
    githubUrl: p.githubLink,
    liveUrl: p.liveLink,
    createdAt: p.updatedAt.toISOString(),
    type: "Internship" as const,
  }));

  const combinedProjects = [
    ...formattedStandalone,
    ...formattedInternship,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-[#f9fafb] min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 text-sm">Dashboard & Activity</p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6 items-start">
          <div className="flex-1 space-y-6 w-full">
            {}
            <ProblemSolvingOverview stats={difficultyStats} />

            <ActivityTabs
              initialSubmissions={formattedSubmissions}
              initialProjects={combinedProjects}
              totalSubmissionsCount={totalSubmissionsCount}
              totalProjectsCount={combinedTotalProjects}
              userId={profile.id}
            />
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <ProfilePanel user={profileForPanel} />
          </div>
        </div>
      </div>
    </div>
  );
}
