import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import NavbarSignedIn from "./Navbar/NavbarSignedIn";
import NavbarSignedOut from "./Navbar/NavbarSignedOut";

async function getUserProfile(userId: string) {
  try {
    const userProfile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar_url: true,
        xp: true,
        stars: true,
        username: true,
        league: true,
      },
    });
    return userProfile;
  } catch (error) {
    console.error("Failed to fetch user profile in Navbar:", error);
    return null;
  }
}

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <NavbarSignedOut />;
  }

  const profile = await getUserProfile(user.id);

  const normalizedProfile = profile
    ? {
        ...profile,
        username: profile.username ?? "",
        name: profile.name ?? "",
        avatar_url: profile.avatar_url ?? "",
      }
    : null;

  return <NavbarSignedIn initialProfile={normalizedProfile} />;
}