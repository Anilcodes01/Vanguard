"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import Navbar from "@/app/components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar/Siderbar";
import RightSidePanel from "../components/ui/RightSidePanel/RightSidePanle";
import { UserProfile } from "@/types";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const hasProfile = !!profile;

  const isProblemPage = pathname?.startsWith("/problems/") && pathname !== "/problems";
  const isInternshipPage = pathname === "/internship";
  const isExplorePage = pathname === "/explore";

  const handleMouseEnter = useCallback(() => {
    if (hasProfile) setIsHovered(true);
  }, [hasProfile]);

  const handleMouseLeave = useCallback(() => {
    if (hasProfile) setIsHovered(false);
  }, [hasProfile]);

  const handleToggleSidebar = useCallback(() => {
    if (hasProfile) setIsHovered((prev) => !prev);
  }, [hasProfile]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(userProfile);
      }
      setIsLoading(false);
    };

    fetchUserAndProfile();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          Loading...
        </main>
      </div>
    );
  }

  const collapsed = !isHovered;

  const loggedInLayout = (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      <main
        className={`overflow-auto w-full scrollbar-hide bg-white min-h-0 ${
          isProblemPage ? "flex-1" : "flex-1 lg"
        }`}
      >
        {children}
      </main>

      {!isProblemPage && !isInternshipPage && !isExplorePage && <RightSidePanel />}
    </div>
  );

  const guestLayout = (
    <main className="flex-1 overflow-y-auto bg-white min-h-0">
      {children}
    </main>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar onToggleSidebar={hasProfile ? handleToggleSidebar : undefined} />

      {hasProfile ? loggedInLayout : guestLayout}
    </div>
  );
}