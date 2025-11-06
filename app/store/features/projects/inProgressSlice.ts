import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface InProgressProject {
  id: string;
  name: string;
  domain: string;
  maxTime: string;
  coverImage: string | null;
  description: string;
  startedAt?: string;
}

interface ProjectsApiResponse {
  projects: InProgressProject[];
}

export const fetchInProgressProjects = createAsyncThunk(
  "inProgressProjects/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/projects/in-progress");
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch in-progress projects"
        );
      }
      const data: ProjectsApiResponse = await response.json();
      return data.projects;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

interface InProgressProjectsState {
  projects: InProgressProject[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: InProgressProjectsState = {
  projects: [],
  status: "idle",
  error: null,
};

const inProgressProjectsSlice = createSlice({
  name: "inProgressProjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInProgressProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchInProgressProjects.fulfilled,
        (state, action: PayloadAction<InProgressProject[]>) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(fetchInProgressProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default inProgressProjectsSlice.reducer;
