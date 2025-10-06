"use client";

import { useEffect, useState, use } from "react";
import { XCircle, CheckCircle, Code, Clock } from "lucide-react";
import ProfilePanel from "@/app/components/Profile/ProfilePanel";

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
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    <p className="ml-4 text-lg">Loading Profile...</p>
  </div>
);
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
    <XCircle size={48} />
    <h2 className="mt-4 text-2xl font-semibold">Something went wrong</h2>
    <p className="mt-2">{message}</p>
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

  return (
    <div className="bg-gray-800 flex justify-center text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl w-full flex rounded-lg overflow-hidden">
        <div className="w-[70%] px-8">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-green-100 p-6 rounded-lg">
                <CheckCircle
                  className="mx-auto text-green-600 mb-2"
                  size={32}
                />
                <p className="text-3xl font-bold text-gray-800">{solvedCount}</p>
                <p className="text-gray-600">Problems Solved</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded-lg">
                <Code className="mx-auto text-yellow-600 mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-800">{attemptedCount}</p>
                <p className="text-gray-600">Problems Attempted</p>
              </div>
              <div className="bg-blue-100 p-6 rounded-lg">
                <Clock className="mx-auto text-blue-600 mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-800">{totalSubmissions}</p>
                <p className="text-gray-600">Total Submissions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[30%]">
          <ProfilePanel user={profile} />
        </div>
      </div>
    </div>
  );
}