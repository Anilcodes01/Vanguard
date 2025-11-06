import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DailyProblem, LeaderboardData } from "@/types";

interface DashboardData {
  userId: string;
  dailyProblem: DailyProblem | null;
  leaderboard: LeaderboardData;
}

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async () => {
    const response = await fetch("/api/dashboardData");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch dashboard data");
    }
    const data: DashboardData = await response.json();
    return data;
  }
);

interface DashboardState {
  dailyProblem: DailyProblem | null;
  leaderboardData: LeaderboardData | null;
  currentUserId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  dailyProblem: null,
  leaderboardData: null,
  currentUserId: null,
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    hydrateDashboard: (state, action: PayloadAction<{ dailyProblem: DailyProblem | null }>) => {
        state.status = 'succeeded';
        state.dailyProblem = action.payload.dailyProblem;
        state.error = null;
    },
    resetDashboard: (state) => {
      state.dailyProblem = null;
      state.leaderboardData = null;
      state.currentUserId = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchDashboardData.fulfilled,
        (state, action: PayloadAction<DashboardData>) => {
          state.status = "succeeded";
          state.dailyProblem = action.payload.dailyProblem;
          state.leaderboardData = action.payload.leaderboard;
          state.currentUserId = action.payload.userId;
        }
      )
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An unknown error occurred";
      });
  },
});

export const { hydrateDashboard, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;