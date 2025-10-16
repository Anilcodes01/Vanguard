import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Project {
  id: string;
  name: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  description: string;
  createdAt: string; 
  updatedAt: string;
}

interface ProjectsApiResponse {
  projects: Project[];
}

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await fetch('/api/projects/getProjects');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch projects');
    }
    const data: ProjectsApiResponse = await response.json();
    return data.projects; 
  }
);

interface ProjectsState {
  projects: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  status: 'idle',
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    resetProjects: (state) => {
      state.projects = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An unknown error occurred';
      });
  },
});

export const { resetProjects } = projectsSlice.actions;
export default projectsSlice.reducer;