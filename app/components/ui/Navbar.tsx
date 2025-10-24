import NavbarSignedIn from './Navbar/NavbarSignedIn';
import NavbarSignedOut from './Navbar/NavbarSignedOut';
import { createClient } from '@/app/utils/supabase/server';

export default async function Navbar() {
  const supabase = await createClient(); 

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? <NavbarSignedIn /> : <NavbarSignedOut />;
}