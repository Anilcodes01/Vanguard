'use client'; 

import { createClient } from '../utils/supabase/client';
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
      style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: 'tomato',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Sign Out
    </button>
  );
}