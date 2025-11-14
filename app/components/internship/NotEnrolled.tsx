"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

type ProfileType = {
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
  internshipEnrolled: boolean;
  league: string;
  currentGroupId: string | null;
};

const LoadingSpinner = () => (
  <div className="border-4 border-t-4 border-gray-200 border-t-green-500 rounded-full w-12 h-12 animate-spin"></div>
);

export default function NotEnrolled() {
  const [isModalOpen] = useState(true);
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [viewState, setViewState] = useState("centered");
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [profileData, setProfileData] = useState<ProfileType | null>(null);

  useEffect(() => {
    fetch("/bot.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    setViewState("side-by-side");

    try {
      const response = await fetch("/api/internship/greet", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to fetch greeting");
      }
      const data = await response.json();
      setGreeting(data.greeting);
      setProfileData(data.profileData);
    } catch (error) {
      console.error(error);
      setGreeting("Sorry, I couldn&apos;t prepare your greeting. Please check your profile.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderProfileField = (label: string, value: string | number | string[] | null | undefined) => {
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
      <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
          type="text"
          defaultValue={String(displayValue || "")}
          className="mt-1 block w-full bg-[#444] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen justify-center items-center text-white overflow-hidden">
      {isModalOpen && (
        <div
          className={`fixed inset-0 flex justify-center items-center ${
            viewState === "centered" ? " bg-opacity-50" : ""
          }`}
        >
          <div
            className={`modal-transition rounded-lg p-8 text-center ${
              viewState === "centered" ? "modal-center" : "modal-left"
            }`}
          >
            {animationData && (
              <Lottie animationData={animationData} loop={true} style={{ height: 200, width: "100%" }} />
            )}
            {viewState === "centered" ? (
              <>
                <h2 className="text-2xl font-bold mt-4 mb-2">Welcome!</h2>
                <p className="mb-6">It looks like you haven&apos;t enrolled yet. Get started to unlock new opportunities!</p>
                <button
                  onClick={handleGetStarted}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="mt-4">
                {isLoading ? <p>Personalizing your welcome...</p> : <p className="text-left">{greeting}</p>}
              </div>
            )}
          </div>

          {viewState === "side-by-side" && (
            <div className="profile-panel absolute right-0 top-0 h-full w-1/2 flex items-center justify-center bg-[#2a2a2a] opacity-0 animate-fade-in overflow-y-auto">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="w-full max-w-md p-8">
                  <h3 className="text-2xl font-bold mb-6">Your Profile</h3>
                  {profileData ? (
                    <form className="space-y-4 text-left">
                      {renderProfileField("Name", profileData.name)}
                      {renderProfileField("Username", profileData.username)}
                      {renderProfileField("College", profileData.college_name)}
                      {renderProfileField("Year of Study", profileData.year_of_study)}
                      {renderProfileField("Primary Field", profileData.primary_field)}
                      {renderProfileField("Domain", profileData.domain)}
                      {renderProfileField("XP", profileData.xp)}
                      {renderProfileField("Stars", profileData.stars)}
                      {renderProfileField("League", profileData.league)}
                      {renderProfileField("Comfort Level", profileData.comfort_level)}
                      {renderProfileField("Preferred Languages", profileData.preferred_langs)}
                      {renderProfileField("Platform Experience", profileData.platform_exp)}
                      {renderProfileField("Main Goal", profileData.main_goal)}
                      {renderProfileField("Challenge Preference", profileData.challenge_pref)}
                      {renderProfileField("Motivation", profileData.motivation)}
                      {renderProfileField("Time Dedication", profileData.time_dedication)}
                      {renderProfileField("Internship Interest", profileData.internship_interest)}
                      {renderProfileField("Role Interest", profileData.role_interest)}
                      {renderProfileField("Project Preference", profileData.project_pref)}
                      {renderProfileField("Playstyle", profileData.playstyle)}
                      <button type="submit" className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <p>Could not load profile data.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}