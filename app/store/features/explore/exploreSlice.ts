import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Difficulty } from '@prisma/client';

type UserProfile = {
  name: string | null;
  avatar_url: string | null;
};

type SubmittedProjectInfo = {
  user: {
    profiles: UserProfile[] | null;
  };
  _count: {
    upvotes: number;
    comments: number;
  };
};

interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  coverImage: string | null;
  SubmittedProjects: SubmittedProjectInfo[];
}

interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string[];
  _count: {
    solutions: number;
  };
}

interface ExploreState {
  topProjects: Project[];
  topProblems: Problem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExploreState = {
  topProjects: [],
  topProblems: [],
  status: 'idle',
  error: null,
};

export const fetchExploreData = createAsyncThunk(
  'explore/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [projectsResponse, problemsResponse] = await Promise.all([
        fetch('/api/projects/topProjects'),
        fetch('/api/problems/topProblems'),
      ]);

      if (!projectsResponse.ok || !problemsResponse.ok) {
        throw new Error('Failed to fetch explore page data');
      }

      const projectsData = await projectsResponse.json();
      const problemsData = await problemsResponse.json();
      
      return { projectsData, problemsData };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExploreData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExploreData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.topProjects = action.payload.projectsData;
        state.topProblems = action.payload.problemsData;
      })
      .addCase(fetchExploreData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default exploreSlice.reducer;