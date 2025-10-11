"use client";

import { useEffect, useState, use } from "react";
import {
  CheckCircle,
  Code2,
  Target,
  Activity,
} from "lucide-react";
import {
  ProfilePanel,
  ErrorDisplay,
  LoadingSpinner,
  StatCard,
} from "@/app/components/Profile/ProfilePanel";
import { UserData } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/profileData/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch data");
        }
        const result = await response.json();
        setUserData(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!userData || !userData.profiles || userData.profiles.length === 0) {
    return <ErrorDisplay message="This user profile could not be found." />;
  }

  const profile = userData.profiles[0];
  const solvedCount = userData.problemSolutions.filter(
    (s) => s.status === "Solved"
  ).length;
  const attemptedCount = userData.problemSolutions.length;
  const totalSubmissions = userData.submissions.length;

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

  return (
    <div className="bg-[#262626] text-neutral-300 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-100">
            {profile.name}&apos;s Profile
          </h1>
          <p className="text-neutral-500">
            Welcome to the activity and progress dashboard.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
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

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-100">
                  Recent Submissions
                </h2>
              </div>
              {userData.submissions.length > 0 ? (
                <div className="divide-y divide-neutral-800">
                  {userData.submissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="grid grid-cols-3 items-center p-4 gap-4 hover:bg-neutral-900 transition-colors"
                    >
                      <p className="text-neutral-200 font-medium truncate col-span-2 sm:col-span-1">
                        {submission.problem.title}
                      </p>
                      <p className="hidden sm:block text-neutral-500 text-sm">
                        {new Date(submission.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
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
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <ProfilePanel user={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
