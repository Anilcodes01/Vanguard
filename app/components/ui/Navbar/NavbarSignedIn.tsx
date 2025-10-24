"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import UserAvatar from "../Avatar";
import Image from "next/image";
import { Star, Zap } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { fetchUserProfile } from "@/app/store/features/profile/profileSlice"; 
import { useEffect } from "react";

const LeaderboardImagesData = [
  { name: 'Bronze', imagePath: '/leagues/bronze.png' },
  { name: 'Amethyst', imagePath: '/leagues/amethyst.png' },
  { name: 'Diamond', imagePath: '/leagues/diamond.png' },
  { name: 'Emerald', imagePath: '/leagues/emerald.png' },
  { name: 'Gold', imagePath: '/leagues/gold.png' },
  { name: 'Obsidian', imagePath: '/leagues/obsidian.png' },
  { name: 'Pearl', imagePath: '/leagues/pearl.png' },
  { name: 'Ruby', imagePath: '/leagues/ruby.png' }
];

export default function NavbarSignedIn() {
   const dispatch: AppDispatch = useDispatch();
    const { profile, status } = useSelector((state: RootState) => state.profile);
    const isLoading = status === "loading" || status === "idle";

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchUserProfile()); 
        }
    }, [status, dispatch]);

  const leagueImage = profile?.league
    ? LeaderboardImagesData.find((img) => img.name.toLowerCase() === profile.league!.toLowerCase())
    : null;

  const links = [
    { key: "explore", name: "Explore", path: "/explore" },
    { key: "problems", name: "Problems", path: "/problems" },
    { key: "discussions", name: "Discussions", path: "/discussions" },
    { key: "leaderboard", name: "Leaderboard", path: "/leaderboard" },
    { key: "Projects", name: "Projects", path: "/projects" },
  ];

  return (
    <nav className="flex items-center   justify-around bg-[#262626] text-white px-4 py-2 w-full">
      <Link className="text-2xl flex gap-2 font-bold" href={"/"}>
        <Image
          src={"/adapt.png"}
          alt="adapt logo"
          width={200}
          height={200}
          className="h-8 w-8"
        />
      </Link>

      <div className="flex gap-8 ">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.path}
            className="cursor-pointer hover:text-gray-500"
          >
            {link.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <>
            <div className="h-8 w-24 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse" />
          </>
        ) : (
          profile && (
            <>
              {leagueImage && (
                <Link 
                  href="/leaderboard" 
                  className="flex items-center gap- bg-neutral-700/50 border border-neutral-600/60  p-1.5 rounded-full text-sm hover:bg-neutral-700 transition-colors"
                >
                  <Image
                    src={leagueImage.imagePath}
                    alt={`${leagueImage.name} league`}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </Link>
              )}
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-sm">
                <Star
                  size={14}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="font-bold text-white">{profile.stars}</span>
              </div>
              <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full text-sm">
                <Zap size={14} className="text-sky-400" />
                <span className="font-bold text-white">{profile.xp}</span>
                <span className="text-gray-400">XP</span>
              </div>
              <UserAvatar user={profile} />
            </>
          )
        )}
      </div>
    </nav>
  );
}