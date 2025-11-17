"use client";

import { ComponentType, useState } from "react";
import {
  XCircle,
  Code2,
  Zap,
  Star,
  School,
  Pencil,
  Check,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";
import { ProfileData } from "@/types";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#ffffff]">
    <div className="w-12 h-12 border-4 border-gray-500 border-t-neutral-400 rounded-full animate-spin"></div>
  </div>
);

export const ErrorDisplay = ({ message }: { message: string | null }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff] text-center p-4">
    <XCircle className="text-red-500/80 mb-4" size={48} />
    <h2 className="text-xl font-bold text-neutral-200">Profile Not Found</h2>
    <p className="text-neutral-500 max-w-sm">{message}</p>
  </div>
);

export const StatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ size: number; className: string }>;
  value: number | string;
  label: string;
}) => (
  <div className=" border  rounded-xl p-5">
    <div className="flex items-center gap-3 mb-3">
      <Icon size={18} className="text-black" />
      <h3 className="text-sm text-black">{label}</h3>
    </div>
    <p className="text-3xl font-bold text-black">{value}</p>
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
    <div className=" border  rounded-xl p-6 sticky top-6">
      <div className="flex flex-col items-center text-center">
        <Image
          src={
            user.avatar_url ||
            `https://ui-avatars.com/api/?name=${
              user.name || "A"
            }&background=171717&color=fff`
          }
          alt={user.name || "User"}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover mb-4 border-2 "
        />
        <h2 className="text-xl font-bold text-black">
          {user.name || "Anonymous User"}
        </h2>
        {user.username && (
          <p className="text-black text-sm">@{user.username}</p>
        )}
      </div>

      <div className="border-t  my-6"></div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Zap size={16} className="text-sky-500" />
          <span className="text-black">Total XP:</span>
          <span className="font-bold text-black ml-auto">{user.xp}</span>
        </div>
        <div className="flex items-center gap-3">
          <Star size={16} className="text-yellow-500" />
          <span className="text-black">Total Stars:</span>
          <span className="font-bold text-black ml-auto">
            {user.stars}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={leagueImage.imagePath}
            alt={`${leagueImage.name} league badge`}
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span className="text-black">League:</span>
          <span className="font-bold text-black ml-auto">
            {currentLeague}
          </span>
        </div>
      </div>

      <div className="border-t  my-6"></div>

      <div className="space-y-4 text-sm">
        {user.college_name && (
          <div className="flex items-start gap-3">
            <School size={16} className="text-black mt-0.5 shrink-0" />
            <p className="text-black">{user.college_name}</p>
          </div>
        )}
        {user.domain && (
          <div className="flex items-start gap-3">
            <Code2 size={16} className="text-black mt-0.5 shrink-0" />
            <p className="text-black">{user.domain}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {user.username && (
          <button
            onClick={handleCopyLink}
            className="group flex w-full items-center justify-center gap-2 rounded-lg  px-4 py-2 text-sm text-green-500 transition-colors  hover:text-black hover:bg-gray-200"
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Share2 size={14} /> Share Profile
              </>
            )}
          </button>
        )}
        <Link
          href={`/editProfile/${user.username}`}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg- px-4 py-2 text-sm text-green-500 transition-colors  hover:text-black hover:bg-gray-200"
        >
          <Pencil size={14} />
          Edit Profile
        </Link>
      </div>
    </div>
  );
};
