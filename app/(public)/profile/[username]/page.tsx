import { CheckCircle, Code2, Target, Activity } from "lucide-react";
import { ProfilePanel } from "@/app/components/Profile/ProfilePanel";
import { ErrorDisplay } from "@/app/components/Profile/ProfilePanel";
import SubmittedProjectsList from "@/app/components/Profile/SubmittedProjectsList";
import { getProfileData } from "@/app/lib/data/profile";
import { ProfileData } from "@/types";
import { StatCard } from "@/app/components/Profile/StatCard";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const decodedUsername = decodeURIComponent(username);
  console.log("Fetching profile for:", decodedUsername);

  const data = await getProfileData(decodedUsername);

  if (!data || !data.profile) {
    return <ErrorDisplay message="This user profile could not be found." />;
  }

  const { profile, submissions, problemSolutions, submittedProjects } = data;

  const solvedCount = problemSolutions.filter(
    (s) => s.status === "Solved"
  ).length;
  const attemptedCount = problemSolutions.length;
  const totalSubmissions = submissions.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "text-green-400 bg-green-500/10";
      case "Wrong Answer":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-yellow-400 bg-yellow-500/10";
    }
  };

  const profileForPanel = {
    ...profile,
    league: (profile as ProfileData).league
      ? String((profile as ProfileData).league)
      : "Unranked",
  };

  return (
    <div className="bg-[#ffffff] black min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black">
            {profile.name}&apos;s Profile
          </h1>
          <p className="text-black">
            Welcome to the activity and progress dashboard.
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={CheckCircle}
                value={solvedCount}
                label="Problems Solved"
              />
              <StatCard
                icon={Target}
                value={attemptedCount}
                label="Problems Attempted"
              />
              <StatCard
                icon={Activity}
                value={totalSubmissions}
                label="Total Submissions"
              />
            </div>

            <div className="border text-black rounded-xl">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recent Submissions</h2>
              </div>
              {submissions.length > 0 ? (
                <div className="divide-y">
                  {submissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="grid grid-cols-3 items-center p-4 gap-4 hover:bg-gray-200 transition-colors"
                    >
                      <p className="text-black font-medium truncate col-span-2 sm:col-span-1">
                        {submission.problem.title}
                      </p>
                      <p className="hidden sm:block text-neutral-500 text-sm">
                        {submission.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex justify-end">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Code2 className="mx-auto text-neutral-700 mb-3" size={40} />
                  <p className="text-neutral-500">
                    No submissions have been made yet.
                  </p>
                </div>
              )}
            </div>

            {}
            <SubmittedProjectsList
              projects={submittedProjects.map((p) => ({
                ...p,

                createdAt: p.createdAt.toISOString(),
              }))}
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
