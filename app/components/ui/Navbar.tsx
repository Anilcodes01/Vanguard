import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";
import {prisma} from "@/lib/prisma";
import UserAvatar from "./Avatar"; 

export default async function Navbar() {
  const supabase =await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        avatar_url: true,
      },
    });
  }

  return (
    <nav className="flex items-center justify-between bg-white text-black p-4 border-b border-gray-200 w-full">
      <Link className="text-3xl font-bold " href={"/"}>
        Vanguard
      </Link>
      <div className="flex items-center gap-4">
        {userProfile ? (
          <UserAvatar user={userProfile} />
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}