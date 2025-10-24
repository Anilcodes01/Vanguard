import UserLoggedInLanding from '../components/Landing/UserLoggedinLanding';
import UsernotLoggedInLanding from '../components/Landing/UserNotLoggedinLanding';
import { createClient } from '../utils/supabase/server';

export default async function UserDashboard() {
   const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    return user ? <UserLoggedInLanding /> : <UsernotLoggedInLanding />;
}