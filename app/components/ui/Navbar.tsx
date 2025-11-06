import NavbarSignedIn from './Navbar/NavbarSignedIn';
import NavbarSignedOut from './Navbar/NavbarSignedOut';
import { createClient } from '@/app/utils/supabase/server';
import { fetchUserProfileForNavbar } from '@/app/lib/data'; // Import the new function

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <NavbarSignedOut />;
  }
  
  // Fetch the profile data on the server
  const profile = await fetchUserProfileForNavbar();

  // Pass the server-fetched data as a prop
  return <NavbarSignedIn initialProfile={profile} />;
}