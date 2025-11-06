import { createAsyncThunk, createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { problemSolved } from "@/app/store/actions";

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  avatar_url: string | null;
  weeklyXP: number;
}

interface LeaderboardApiResponse {
  leaderboard: LeaderboardEntry[];
  league: string | null;
  currentUserId: string | null;
  message?: string;
}

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  league: string | null;
  currentUserId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LeaderboardState = {
  leaderboard: [],
  league: null,
  currentUserId: null,
  status: "idle",
  error: null,
};


export const fetchLeaderboard = createAsyncThunk<LeaderboardApiResponse>(
    'leaderboard/fetchLeaderboard',
    async (_, { rejectWithValue }) => {
    const response = await fetch("/api/leaderboard");
    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch leaderboard");
    }

    return data
}
)

const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        // ADD THIS NEW REDUCER
        hydrateLeaderboard: (state, action: PayloadAction<Omit<LeaderboardApiResponse, 'message'>>) => {
            state.status = 'succeeded';
            state.leaderboard = action.payload.leaderboard;
            state.league = action.payload.league;
            state.currentUserId = action.payload.currentUserId;
            state.error = null;
        },
        resetLeaderboard : () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLeaderboard.pending, (state) => {
            state.status = 'loading',
            state.error = null
        })
         .addCase(fetchLeaderboard.fulfilled, (state, action: PayloadAction<LeaderboardApiResponse>) => {
               state.status = 'succeeded';
               const {leaderboard, league, currentUserId, message} = action.payload;

               state.leaderboard = leaderboard;
               state.league = league;
               state.currentUserId = currentUserId;
        })
        .addCase(fetchLeaderboard.rejected, (state, action) => {
            state.status = 'failed';
            state.error = (action.payload as string) || 'An error occurred fetching leaderboard data.';
        })
         .addCase(problemSolved, (state) => {
            state.status = 'idle';
          });
    }

})

export const { hydrateLeaderboard, resetLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;