import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserData } from '@/types';

export const fetchProfileByUsername = createAsyncThunk(
  'viewedProfile/fetchByUsername',
  async (username: string) => {
    const response = await fetch(`/api/profileData/${username}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile data');
    }
    const result = await response.json();
    return result.data as UserData;
  }
);

interface ViewedProfileState {
  profilesCache: { [username: string]: UserData };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ViewedProfileState = {
  profilesCache: {}, 
  status: 'idle',
  error: null,
};

const viewedProfileSlice = createSlice({
  name: 'viewedProfile',
  initialState,
  reducers: {
    clearProfilesCache: (state) => {
      state.profilesCache = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByUsername.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const username = action.meta.arg;
        state.profilesCache[username] = action.payload;
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An unknown error occurred';
      });
  },
});

export const { clearProfilesCache } = viewedProfileSlice.actions;
export default viewedProfileSlice.reducer;