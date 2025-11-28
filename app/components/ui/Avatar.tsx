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
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "danger";
}) => {
  const hoverStyles =
    variant === "danger"
      ? "hover:bg-red-50 hover:text-red-600 text-gray-600"
      : "hover:bg-orange-50 hover:text-[#f59120] text-gray-700";

  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer rounded-lg items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${hoverStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default function UserAvatar({
  user,
  onDropdownItemClick,
}: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      dispatch(logout());
      dispatch(clearProfile());
      onDropdownItemClick?.();
      window.location.href = "/";
    }
  };

  const handleProfileClick = () => {
    if (user.username) {
      router.push(`/profile/${user.username}`);
      setIsOpen(false);
      onDropdownItemClick?.();
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

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
        className={`group h-9 w-9 cursor-pointer rounded-full flex items-center justify-center overflow-hidden border transition-all duration-200 ${
          isOpen
            ? "border-[#f59120] ring-2 ring-[#f59120]/20"
            : "border-gray-200 hover:border-[#f59120]"
        }`}
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name || "User Avatar"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-orange-50 flex items-center justify-center">
            <span className="text-sm font-bold text-[#f59120]">{initial}</span>
          </div>
        )}
      </button>

      <div
        className={`
          absolute right-0 mt-2 w-56 origin-top-right rounded-xl
          bg-white border border-gray-100 shadow-xl shadow-gray-200/50
          transition-all duration-200 ease-out z-50
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 visible"
              : "opacity-0 scale-95 -translate-y-2 invisible"
          }
        `}
      >
        {}
        <div className="px-4 py-3 bg-gray-50/50 rounded-t-xl border-b border-gray-100">
          <p className="text-xs  text-gray-500  tracking-wider mb-0.5">
            Signed in as
          </p>
          <p className="truncate text-xs  text-gray-900">
            {user.name || "User"}
          </p>
        </div>

        <div className="p-1.5 space-y-0.5">
          <DropdownMenuItem onClick={handleProfileClick}>
            <UserIcon size={16} />
            <span>My Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              router.push("/bookmarks");
              setIsOpen(false);
            }}
          >
            <Bookmark size={16} />
            <span>Bookmarks</span>
          </DropdownMenuItem>
        </div>

        <div className="my-1 h-px bg-gray-100 mx-2" />

        <div className="p-1.5">
          <DropdownMenuItem onClick={handleSignOut} variant="danger">
            <LogOut size={16} />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </div>
    </div>
  );
}
