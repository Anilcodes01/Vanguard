"use client";

import { useState } from "react";
import {
  XCircle,
  Code2,
  Zap,
  Star,
  School,
  Pencil,
  Check,
  Share2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";
import { ProfileData } from "@/types";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="w-8 h-8 border-2 border-gray-100 border-t-[#f59120] rounded-full animate-spin"></div>
  </div>
);

export const ErrorDisplay = ({ message }: { message: string | null }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
    <div className="bg-gray-50 p-4 rounded-full mb-4">
      <XCircle className="text-gray-400" size={32} />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">Profile Not Found</h2>
    <p className="text-gray-500 text-sm mt-1">{message}</p>
  </div>
);

export const ProfilePanel = ({ user }: { user: ProfileData }) => {
  const [copied, setCopied] = useState(false);
  const currentLeague = user.league || "Bronze";

  const leagueImage = LeaderboardImagesData.find(
    (l) => l.name === currentLeague
  ) || { name: "Bronze", imagePath: "/leagues/bronze.png" };

  const handleCopyLink = () => {
    if (!user.username) return;
    const profileUrl = `${window.location.origin}/profile/${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-6 shadow-sm">
      {}
      <div className="flex flex-col items-center text-center">
        <Image
          src={
            user.avatar_url ||
            `https://ui-avatars.com/api/?name=${
              user.name || "A"
            }&background=f3f4f6&color=000`
          }
          alt={user.name || "User"}
          width={88}
          height={88}
          className="w-24 h-24 rounded-full object-cover border border-gray-100"
        />

        <h2 className="text-lg font-bold text-gray-900 mt-4">
          {user.name || "Anonymous User"}
        </h2>
        {user.username && (
          <p className="text-gray-400 text-sm">@{user.username}</p>
        )}
      </div>

      {}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Zap size={16} />
            <span>XP</span>
          </div>
          <span className="font-semibold text-gray-900">{user.xp}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Star size={16} />
            <span>Stars</span>
          </div>
          <span className="font-semibold text-gray-900">{user.stars}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Trophy size={16} />
            <span>League</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={leagueImage.imagePath}
              alt={leagueImage.name}
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span className="font-semibold text-gray-900 text-sm">
              {currentLeague}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="mt-6 space-y-3 text-sm text-gray-500">
        {user.college_name && (
          <div className="flex items-center gap-3">
            <School size={16} className="text-gray-400 shrink-0" />
            <p className="truncate">{user.college_name}</p>
          </div>
        )}
        {user.domain && (
          <div className="flex items-center gap-3">
            <Code2 size={16} className="text-gray-400 shrink-0" />
            <p className="truncate">{user.domain}</p>
          </div>
        )}
      </div>

      {}
      <div className="mt-8 flex flex-col gap-3">
        {user.username && (
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-black hover:border-gray-300"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? "Copied" : "Share Profile"}
          </button>
        )}
        <Link
          href={`/editProfile/${user.username}`}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-gray-800 active:scale-[0.98]"
        >
          <Pencil size={14} />
          Edit Profile
        </Link>
      </div>
    </div>
  );
};
