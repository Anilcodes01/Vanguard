

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { problemSolved } from '@/app/store/actions';

export interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  avatar_url: string | null;
  xp: number;
  league: string;
  stars: number;
}

export const fetchUserProfile = createAsyncThunk('profile/fetchUserProfile', async () => {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch profile');
  }
  const data: UserProfile = await response.json();
  return data;
});

interface ProfileState {
  profile: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  status: 'idle',
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
        state.profile = null;
        state.status = 'idle';
    },
    addXp: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.xp += action.payload;
      }
    },
    addStars: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.stars += action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch profile';
      })
       .addCase(problemSolved, (state, action) => {
        if (state.profile) {
          state.profile.xp += action.payload.xpEarned;
          state.profile.stars += action.payload.starsEarned;
        }
      });
  },
});

export const { clearProfile, addXp, addStars } = profileSlice.actions;
export default profileSlice.reducer;