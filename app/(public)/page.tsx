import { createClient } from '../utils/supabase/server';
import UserLoggedInLanding from '../components/Landing/UserLoggedinLanding';
import UsernotLoggedInLanding from '../components/Landing/UserNotLoggedinLanding';
import FullProjectCardSkeleton from '../components/Landing/Projects/ProjectCardSkeleton';
import {
  fetchDashboardData,
  fetchInProgressProjects,
  fetchLeaderboardData,
} from '../lib/data';
import { Suspense } from 'react';

export default async function UserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <UsernotLoggedInLanding />;
  }

  const [dashboardResult, projectsResult, leaderboardResult] = await Promise.all([
    fetchDashboardData(),
    fetchInProgressProjects(),
    fetchLeaderboardData(),
  ]);

  return (
    <Suspense fallback={<FullProjectCardSkeleton />}>
      <UserLoggedInLanding
        initialDashboardData={dashboardResult}
        initialInProgressProjects={projectsResult}
        initialLeaderboardData={leaderboardResult}
      />
    </Suspense>
  );
}