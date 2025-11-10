"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { Bookmark, LogOut, User as UserIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { logout } from "@/app/store/features/auth/authSlice";
import { clearProfile } from "@/app/store/features/profile/profileSlice";
import { UserProfile } from "@/types";

interface UserAvatarProps {
  user: UserProfile;
  onDropdownItemClick?: () => void;
}

const DropdownMenuItem = ({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex w-full cursor-pointer rounded-lg items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-800 ${className}`}
  >
    {children}
  </button>
);

export default function UserAvatar({ user, onDropdownItemClick }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      dispatch(logout());
      dispatch(clearProfile());
      onDropdownItemClick?.(); 
      window.location.href = '/'; 
    }
  };

  const handleProfileClick = () => {
    if (user.username) {
      router.push(`/profile/${user.username}`);
      setIsOpen(false);
      onDropdownItemClick?.(); 
    }
  };



  const initial = user.name ? user.name.charAt(0).toUpperCase() : "V";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border-2 border-neutral-700 transition-colors hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name || "User Avatar"}
            width={40}
            height={40}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <span className="text-lg font-bold text-neutral-300">{initial}</span>
        )}
      </button>

      <div
        className={`
          absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-neutral-900 z-50
          border border-neutral-800 p-1.5 shadow-lg
          transition-all duration-150 ease-in-out
          ${
            isOpen
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-95 invisible"
          }
        `}
      >
        <div className="px-3 py-2">
          <p className="text-xs text-neutral-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-neutral-200">
            {user.name || "User"}
          </p>
        </div>

        <div className="my-1 h-px z-10000 bg-neutral-800" />

        <DropdownMenuItem onClick={handleProfileClick}>
          <UserIcon size={14} className="text-neutral-400" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          router.push('/bookmarks')
        }}>
          <Bookmark size={14} className="text-neutral-400" />
          <span>Bookmarks</span>
        </DropdownMenuItem>

        <div className="my-1 h-px bg-neutral-800" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="hover:text-red-400"
        >
          <LogOut size={14} className="text-neutral-400" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </div>
    </div>
  );
}