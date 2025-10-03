

import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import UserAvatar from '../Avatar';

export default async function NavbarSignedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null; 
  }

  const userProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      avatar_url: true,
    },
  });

  return (
    <nav className="flex items-center justify-between bg-white text-black p-4 border-b border-gray-200 w-full">
      <Link className="text-3xl font-bold" href={"/"}>
        Vanguard
      </Link>
      <div className="flex items-center gap-4">
        {userProfile && <UserAvatar user={userProfile} />}
     
      </div>
    </nav>
  );
}