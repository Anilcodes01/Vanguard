import { createClient } from '../utils/supabase/server';
import UserLoggedInLanding from '../components/Landing/UserLoggedinLanding';
import UsernotLoggedInLanding from '../components/Landing/UserNotLoggedinLanding';
import FullProjectCardSkeleton from '../components/Landing/Projects/ProjectCardSkeleton';
import {
  fetchDashboardData,
  fetchInProgressProjects,
  fetchLeaderboardData,
  fetchUserProfileForNavbar // <-- IMPORT THE PROFILE FETCHER
} from '../lib/data';
import { Suspense } from 'react';

export default async function UserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <UsernotLoggedInLanding />;
  }

  // Fetch all data in parallel, including the user's profile
  const [
    profileResult, // <-- FETCH THE PROFILE HERE
    dashboardResult, 
    projectsResult, 
    leaderboardResult
  ] = await Promise.all([
    fetchUserProfileForNavbar(), // <-- ADD IT TO PROMISE.ALL
    fetchDashboardData(),
    fetchInProgressProjects(),
    fetchLeaderboardData(),
  ]);

  return (
    <Suspense fallback={<FullProjectCardSkeleton />}>
      <UserLoggedInLanding
        initialProfileData={profileResult} // <-- PASS THE PROFILE AS A PROP
        initialDashboardData={dashboardResult}
        initialInProgressProjects={projectsResult}
        initialLeaderboardData={leaderboardResult}
      />
    </Suspense>
  );
}