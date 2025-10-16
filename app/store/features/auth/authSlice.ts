import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/app/utils/supabase/client'; 

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
);

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.status = 'succeeded';
        state.user = action.payload; 
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;