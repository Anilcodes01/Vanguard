

"use client";

import { useEffect, useState, use } from "react";
import { XCircle, CheckCircle, Code, Award, Target, Zap } from "lucide-react";

type ProfileData = {
  name: string | null;
  college_name: string | null;
  avatar_url: string | null;
  username: string | null;
  domain: string | null;
};
type Submission = {
  id: string;
  status: string;
  createdAt: string;
  problem: { title: string };
};
type ProblemSolution = {
  status: "Solved" | "Attempted";
};
type UserData = {
  email: string | null;
  profiles: ProfileData[];
  submissions: Submission[];
  problemSolutions: ProblemSolution[];
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-gray-400 text-lg">Loading Profile...</p>
    </div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <XCircle className="text-rose-400" size={48} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

const ProfilePanel = ({ user }: { user: ProfileData }) => (
  <div className="bg-[#151515] border border-gray-800 rounded-2xl p-8 sticky top-8">
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
          <div className="w-full h-full rounded-full bg-[#151515] flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-5xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-4 border-[#151515] flex items-center justify-center">
          <Award size={20} className="text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">
        {user.name || "Anonymous User"}
      </h2>

      {user.username && (
        <p className="text-gray-400 mb-4">@{user.username}</p>
      )}

      <div className="w-full space-y-3 mt-6">
        {user.college_name && (
          <div className="bg-gray-800/30 rounded-xl p-3 text-left">
            <p className="text-xs text-gray-500 mb-1">College</p>
            <p className="text-sm text-gray-300">{user.college_name}</p>
          </div>
        )}

        {user.domain && (
          <div className="bg-gray-800/30 rounded-xl p-3 text-left">
            <p className="text-xs text-gray-500 mb-1">Domain</p>
            <p className="text-sm text-gray-300">{user.domain}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!userData || !userData.profiles || userData.profiles.length === 0) {
    return <ErrorDisplay message="This user profile could not be found." />;
  }

  const profile = userData.profiles[0];

  const solvedCount = userData.problemSolutions.filter(
    (s) => s.status === "Solved"
  ).length;
  const attemptedCount = userData.problemSolutions.length;
  const totalSubmissions = userData.submissions.length;

  const stats = [
    {
      icon: CheckCircle,
      value: solvedCount,
      label: "Problems Solved",
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: Target,
      value: attemptedCount,
      label: "Problems Attempted",
      color: "amber",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Zap,
      value: totalSubmissions,
      label: "Total Submissions",
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Dashboard</h1>
          <p className="text-gray-400">Track your progress and achievements</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                      >
                        <Icon className={stat.iconColor} size={24} />
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#151515] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">
                Recent Activity
              </h2>
              {userData.submissions.length > 0 ? (
                <div className="space-y-3">
                  {userData.submissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-gray-800/30 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            submission.status === "Accepted"
                              ? "bg-emerald-400"
                              : submission.status === "Wrong Answer"
                              ? "bg-rose-400"
                              : "bg-amber-400"
                          }`}
                        />
                        <div>
                          <p className="text-white font-medium">
                            {submission.problem.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(
                              submission.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          submission.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : submission.status === "Wrong Answer"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="mx-auto text-gray-600 mb-3" size={48} />
                  <p className="text-gray-400">No submissions yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Start solving problems to see your activity
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80">
            <ProfilePanel user={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}