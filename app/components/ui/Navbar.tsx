"use client"; 

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import NavbarSignedIn from './Navbar/NavbarSignedIn';
import NavbarSignedOut from './Navbar/NavbarSignedOut';
import { UserProfile } from '@/types';

export default function Navbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(userProfile);
      }
      setIsLoading(false);
    };

    fetchUserAndProfile();
  }, [supabase]);

  if (isLoading) {
    return <div className="navbar-skeleton h-16 bg-gray-800" />;
  }

  return profile ? <NavbarSignedIn initialProfile={profile} /> : <NavbarSignedOut />;
}