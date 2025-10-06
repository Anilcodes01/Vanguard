'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';

type UserProfile = {
  id: string; 
  name: string | null;
  avatar_url: string | null;
};

export default function UserAvatar({ user }: { user: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); 
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    if (user.id) {
      router.push(`/profile/${user.id}`);
      setIsOpen(false);
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'V';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-gray-400 transition-colors"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.name || 'User Avatar'}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-gray-600">{initial}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700">
            <p className="font-semibold">Signed in as</p>
            <p className="truncate font-medium">{user.name || 'User'}</p>
          </div>
          <div className="border-t flex flex-col border-gray-100 my-1"></div>
          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}