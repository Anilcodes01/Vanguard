"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import UserAvatar from "../Avatar";
import Image from "next/image";
import { Star, Zap, Menu, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { fetchUserProfile } from "@/app/store/features/profile/profileSlice"; 
import { useEffect, useState } from "react";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";
import { motion, AnimatePresence } from "framer-motion";

export default function NavbarSignedIn() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <nav className="relative flex items-center justify-between bg-[#262626] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 w-full">
      <Link className="text-xl sm:text-2xl flex gap-2 font-bold flex-shrink-0 z-30" href={"/"}>
        <Image
          src={"/adapt.png"}
          alt="adapt logo"
          width={200}
          height={200}
          className="h-6 w-6 sm:h-8 sm:w-8"
        />
      </Link>

      <div className="hidden lg:flex gap-4 xl:gap-8 items-center">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.path}
            className="cursor-pointer hover:text-gray-400 transition-colors text-sm xl:text-base whitespace-nowrap"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-shrink-0">
        {isLoading ? (
          <>
            <div className="h-7 w-20 xl:h-8 xl:w-24 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-7 w-16 xl:h-8 xl:w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-7 w-16 xl:h-8 xl:w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-8 xl:h-10 xl:w-10 bg-gray-700 rounded-full animate-pulse" />
          </>
        ) : (
          profile && (
            <>
              {leagueImage && (
                <Link 
                  href="/leaderboard" 
                  className="flex items-center gap-1 bg-neutral-700/50 border border-neutral-600/60 p-1.5 rounded-full text-sm hover:bg-neutral-700 transition-colors"
                  title={`${leagueImage.name} league`}
                >
                  <Image
                    src={leagueImage.imagePath}
                    alt={`${leagueImage.name} league`}
                    width={16}
                    height={16}
                    className="w-3.5 h-3.5 xl:w-4 xl:h-4"
                  />
                </Link>
              )}
              <div className="flex items-center gap-1.5 xl:gap-2 bg-yellow-500/10 border border-yellow-500/20 px-2 xl:px-3 py-1 xl:py-1.5 rounded-full text-xs xl:text-sm">
                <Star
                  size={12}
                  className="text-yellow-400 xl:w-3.5 xl:h-3.5"
                  fill="currentColor"
                />
                <span className="font-bold text-white">{profile.stars}</span>
              </div>
              <div className="flex items-center gap-1.5 xl:gap-2 bg-sky-500/10 border border-sky-500/20 px-2 xl:px-3 py-1 xl:py-1.5 rounded-full text-xs xl:text-sm">
                <Zap size={12} className="text-sky-400 xl:w-3.5 xl:h-3.5" />
                <span className="font-bold text-white">{profile.xp}</span>
                <span className="text-gray-400 hidden xl:inline">XP</span>
              </div>
              <UserAvatar user={profile} />
            </>
          )
        )}
      </div>

      <div className="hidden md:flex lg:hidden items-center gap-2 flex-shrink-0">
        {isLoading ? (
          <>
            <div className="h-7 w-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse" />
          </>
        ) : (
          profile && (
            <>
              {leagueImage && (
                <Link 
                  href="/leaderboard" 
                  className="flex items-center bg-neutral-700/50 border border-neutral-600/60 p-1.5 rounded-full text-sm hover:bg-neutral-700 transition-colors"
                  title={`${leagueImage.name} league`}
                >
                  <Image
                    src={leagueImage.imagePath}
                    alt={`${leagueImage.name} league`}
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </Link>
              )}
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full text-xs">
                <Star
                  size={12}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="font-bold text-white">{profile.stars}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-full text-xs">
                <Zap size={11} className="text-sky-400" />
                <span className="font-bold text-white">{profile.xp}</span>
              </div>
              <UserAvatar user={profile} />
            </>
          )
        )}
      </div>

      <div className="md:hidden flex items-center z-30">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="text-white p-1 hover:bg-neutral-700/50 rounded-md transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-10 md:hidden" 
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-[#262626] md:hidden z-20 shadow-lg border-t border-neutral-700"
            >
              <div className="flex flex-col items-center gap-3 py-4 px-4">
            
                {links.map((link, index) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="w-full"
                  >
                    <Link
                      href={link.path}
                      className="cursor-pointer hover:text-gray-400 transition-colors text-base w-full text-center py-2 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex flex-col items-center gap-3 mt-2 border-t border-neutral-700 pt-4 w-full"
                >
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
                            className="flex items-center gap-2 bg-neutral-700/50 border border-neutral-600/60 p-2.5 rounded-full text-sm hover:bg-neutral-700 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Image
                              src={leagueImage.imagePath}
                              alt={`${leagueImage.name} league`}
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            <span className="text-white font-medium">{profile.league} League</span>
                          </Link>
                        )}
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full text-sm">
                          <Star
                            size={16}
                            className="text-yellow-400"
                            fill="currentColor"
                          />
                          <span className="font-bold text-white">{profile.stars}</span>
                          <span className="text-gray-400">Stars</span>
                        </div>
                        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-full text-sm">
                          <Zap size={16} className="text-sky-400" />
                          <span className="font-bold text-white">{profile.xp}</span>
                          <span className="text-gray-400">XP</span>
                        </div>
                        <div onClick={() => setIsMenuOpen(false)}>
                          <UserAvatar user={profile} />
                        </div>
                      </>
                    )
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}