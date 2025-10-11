"use client";

import Link from "next/link";
import { useUser } from "@/app/context/userContext";
import UserAvatar from "../Avatar";
import Image from "next/image";
import { Star, Zap } from "lucide-react";

export default function NavbarSignedIn() {
  const { userProfile, isLoading } = useUser();

  if (!userProfile && !isLoading) {
    return null;
  }

  const links = [
    { key: "explore", name: "Explore", path: "/explore" },
    { key: "problems", name: "Problems", path: "/problems" },
    { key: "discussions", name: "Discussions", path: "/discussions" },
    { key: "leaderboard", name: "Leaderboard", path: "/leaderboard" },
    { key: "Projects", name: "Projects", path: "/projects" },
  ];

  return (
    <nav className="flex items-center border-zinc-500 border-b justify-around bg-[#262626] text-white px-4 py-2 w-full">
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
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse" />
          </>
        ) : (
          userProfile && (
            <>
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-sm">
                <Star
                  size={14}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="font-bold text-white">
                  {userProfile.stars}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full text-sm">
                <Zap size={14} className="text-sky-400" />
                <span className="font-bold text-white">{userProfile.xp}</span>
                <span className="text-gray-400">XP</span>
              </div>

              <UserAvatar user={userProfile} />
            </>
          )
        )}
      </div>
    </nav>
  );
}
