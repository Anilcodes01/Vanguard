'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return <div className='flex items-center justify-center min-h-screen'>
    <button className='bg-red-500 rounded-2xl px-4 py-2' onClick={handleSignOut}>Sign Out</button>
  </div>
}