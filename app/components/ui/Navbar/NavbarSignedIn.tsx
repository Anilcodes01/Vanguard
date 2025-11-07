"use client";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { setInitialProfile, UserProfile } from "@/app/store/features/profile/profileSlice";
import { useEffect, useState } from "react";
import UserAvatar from "../Avatar";
import Image from "next/image";
import { Star, Zap, Menu, X } from "lucide-react";
import { LeaderboardImagesData } from "@/lib/data/leaderboardImagesData";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarSignedInProps {
  initialProfile: UserProfile | null;
}

export default function NavbarSignedIn({ initialProfile }: NavbarSignedInProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const router = useRouter();

  useEffect(() => {
    if (initialProfile && !profile) {
      dispatch(setInitialProfile(initialProfile));
    }
  }, [initialProfile, profile, dispatch]);

  const displayProfile = profile || initialProfile;

  const leagueImage = displayProfile?.league
    ? LeaderboardImagesData.find((img) => img.name.toLowerCase() === displayProfile.league!.toLowerCase())
    : null;

  const links = [
    { key: "explore", name: "Explore", path: "/explore" },
    { key: "problems", name: "Problems", path: "/problems" },
    { key: "discussions", name: "Discussions", path: "/discussions" },
    { key: "leaderboard", name: "Leaderboard", path: "/leaderboard" },
    { key: "Projects", name: "Projects", path: "/projects" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const handleDropdownItemClick = () => {
    setIsMenuOpen(false);
  };

  if (!displayProfile) {
    return (
      <nav className="relative flex items-center justify-between bg-[#262626] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 w-full">
         <div className="h-8 w-24 bg-gray-700 rounded-full animate-pulse" />
      </nav>
    );
  }

  return (
    <nav className="relative flex items-center justify-between bg-[#262626] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 w-full">
      <button className="text-xl sm:text-2xl flex gap-2 font-bold flex-shrink-0 z-30" onClick={() => router.push("/")}>
        <Image src={"/adapt.png"} alt="adapt logo" width={200} height={200} className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>

      <div className="hidden lg:flex gap-4 xl:gap-8 items-center">
        {links.map((link) => (
          <button key={link.key} onClick={() => router.push(link.path)} className="cursor-pointer hover:text-gray-400 transition-colors text-sm xl:text-base whitespace-nowrap">
            {link.name}
          </button>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-shrink-0">
        {leagueImage && (
          <button onClick={() => router.push("/leaderboard")} className="flex items-center gap-1 bg-neutral-700/50 border border-neutral-600/60 p-1.5 rounded-full text-sm hover:bg-neutral-700 transition-colors" title={`${leagueImage.name} league`}>
            <Image src={leagueImage.imagePath} alt={`${leagueImage.name} league`} width={16} height={16} className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
          </button>
        )}
        <div className="flex items-center gap-1.5 xl:gap-2 bg-yellow-500/10 border border-yellow-500/20 px-2 xl:px-3 py-1 xl:py-1.5 rounded-full text-xs xl:text-sm">
          <Star size={12} className="text-yellow-400 xl:w-3.5 xl:h-3.5" fill="currentColor" />
          <span className="font-bold text-white">{displayProfile.stars}</span>
        </div>
        <div className="flex items-center gap-1.5 xl:gap-2 bg-sky-500/10 border border-sky-500/20 px-2 xl:px-3 py-1 xl:py-1.5 rounded-full text-xs xl:text-sm">
          <Zap size={12} className="text-sky-400 xl:w-3.5 xl:h-3.5" />
          <span className="font-bold text-white">{displayProfile.xp}</span>
          <span className="text-gray-400 hidden xl:inline">XP</span>
        </div>
        <UserAvatar user={displayProfile} onDropdownItemClick={handleDropdownItemClick} />
      </div>
      
      <div className="hidden md:flex lg:hidden items-center gap-2 flex-shrink-0">
        {leagueImage && (
            <button onClick={() => router.push("/leaderboard")} className="flex items-center bg-neutral-700/50 border border-neutral-600/60 p-1.5 rounded-full text-sm hover:bg-neutral-700 transition-colors" title={`${leagueImage.name} league`}>
                <Image src={leagueImage.imagePath} alt={`${leagueImage.name} league`} width={14} height={14} className="w-3.5 h-3.5" />
            </button>
        )}
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full text-xs">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <span className="font-bold text-white">{displayProfile.stars}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-full text-xs">
            <Zap size={11} className="text-sky-400" />
            <span className="font-bold text-white">{displayProfile.xp}</span>
        </div>
        <UserAvatar user={displayProfile} onDropdownItemClick={handleDropdownItemClick} />
      </div>

      <div className="md:hidden flex items-center z-30">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-1 hover:bg-neutral-700/50 rounded-md transition-colors" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="absolute top-full left-0 w-full bg-[#262626] md:hidden z-20 shadow-lg border-t border-neutral-700">
              <div className="flex flex-col items-center gap-3 py-4 px-4">
                {links.map((link, index) => (
                  <motion.div key={link.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }} className="w-full">
                    <button onClick={() => handleNavigation(link.path)} className="cursor-pointer hover:text-gray-400 transition-colors text-base w-full text-center py-2 block">
                      {link.name}
                    </button>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }} className="flex flex-col items-center gap-3 mt-2 border-t border-neutral-700 pt-4 w-full">
                    {leagueImage && (
                        <button onClick={() => handleNavigation("/leaderboard")} className="flex items-center gap-2 bg-neutral-700/50 border border-neutral-600/60 p-2.5 rounded-full text-sm hover:bg-neutral-700 transition-colors">
                            <Image src={leagueImage.imagePath} alt={`${leagueImage.name} league`} width={20} height={20} className="w-5 h-5" />
                            <span className="text-white font-medium">{displayProfile.league} League</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full text-sm">
                        <Star size={16} className="text-yellow-400" fill="currentColor" />
                        <span className="font-bold text-white">{displayProfile.stars}</span>
                        <span className="text-gray-400">Stars</span>
                    </div>
                    <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-full text-sm">
                        <Zap size={16} className="text-sky-400" />
                        <span className="font-bold text-white">{displayProfile.xp}</span>
                        <span className="text-gray-400">XP</span>
                    </div>
                    <UserAvatar user={displayProfile} onDropdownItemClick={handleDropdownItemClick} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}