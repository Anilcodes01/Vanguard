import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import UserAvatar from '../Avatar';
import Image from 'next/image';

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
      id: true, 
      name: true,
      avatar_url: true,
    },
  });

  const links = [
    {
      key: 'explore',
      name: 'Explore',
      path: '/explore'
    },
    {
     key:'problems',
     name: 'Problems',
     path: '/problems'
    },
    {
     key: 'discussions',
     name: 'Discussions',
     path: '/discussions'
    },
    {
      key: 'leaderboard',
      name: 'Leaderboard',
      path: '/leaderboard'
    }
  ]

  return (
    <nav className="flex items-center justify-around bg-white text-black px-4 py-2 border-b border-gray-200 w-full">
     <Link className="text-2xl flex gap-2 font-bold" href={"/"}>
       <Image src={'/adapt.png'} alt='adapt logo' width={200} height={200} className='h-8 w-8' />
      </Link>

      <div className='flex gap-8 '>
        {links.map((link) => (
          <Link key={link.key} href={link.path} 
          className='cursor-pointer hover:text-gray-500'>
            {link.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {userProfile && <UserAvatar user={userProfile} />}
      </div>
    </nav>
  );
}