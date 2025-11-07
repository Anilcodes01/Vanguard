
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import profileReducer from './features/profile/profileSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';
import projectsReducer from './features/projects/projectSlice';
import viewedProfileReducer from './features/viewedProfile/viewedProfileSlice';
import problemsListReducer from './features/problems/problemsSlice';
import leaderboardReducer from './features/leaderboard/leaderboardSlice';
import inProgressProjectsReducer from './features/projects/inProgressSlice';
import exploreReducer from './features/explore/exploreSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    dashboard: dashboardReducer,
    projects: projectsReducer,
    viewedProfile: viewedProfileReducer,
    problemsList: problemsListReducer,
    leaderboard: leaderboardReducer,
    inProgressProjects: inProgressProjectsReducer,
    explore: exploreReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;