'use client'; 

import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
     className='text-white bg-red-400 rounded-2xl px-4 py-2'
    >
      Sign Out
    </button>
  );
}