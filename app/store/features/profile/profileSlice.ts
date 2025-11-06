import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { problemSolved } from '@/app/store/actions';
import { UserProfile } from '@/types';

export const fetchUserProfile = createAsyncThunk('profile/fetchUserProfile', async () => {
    // This thunk can still be used for client-side re-fetching if needed
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }
    return (await response.json()) as UserProfile;
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
    // ADD THIS NEW REDUCER
    hydrateProfile: (state, action: PayloadAction<UserProfile | null>) => {
        state.profile = action.payload;
        state.status = action.payload ? 'succeeded' : 'idle';
        state.error = null;
    },
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

export const { hydrateProfile, clearProfile, addXp, addStars } = profileSlice.actions;
export default profileSlice.reducer;