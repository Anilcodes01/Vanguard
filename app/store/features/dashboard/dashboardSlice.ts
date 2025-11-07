import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DailyProblem, LeaderboardEntry, InProgressProject } from "@/types";

interface ConsolidatedDashboardData {
  dailyProblem: DailyProblem | null;
  projects: InProgressProject[];
  leaderboard: LeaderboardEntry[];
  league: string | null;
  currentUserId: string;
}

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch dashboard data"
        );
      }
      return (await response.json()) as ConsolidatedDashboardData;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

interface DashboardState {
  dailyProblem: DailyProblem | null;
  inProgressProjects: InProgressProject[];
  leaderboard: LeaderboardEntry[];
  league: string | null;
  currentUserId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  dailyProblem: null,
  inProgressProjects: [],
  leaderboard: [],
  league: null,
  currentUserId: null,
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
     resetDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDashboard.fulfilled,
        (state, action: PayloadAction<ConsolidatedDashboardData>) => {
          state.status = "succeeded";
          state.dailyProblem = action.payload.dailyProblem;
          state.inProgressProjects = action.payload.projects;
          state.leaderboard = action.payload.leaderboard;
          state.league = action.payload.league;
          state.currentUserId = action.payload.currentUserId;
        }
      )
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;