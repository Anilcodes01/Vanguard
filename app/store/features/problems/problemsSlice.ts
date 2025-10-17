import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Problem {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  solved?: boolean;
}

interface ApiResponse {
  problems: Problem[];
  totalCount: number;
}

export const fetchProblemsPage = createAsyncThunk(
  "problemsList/fetchPage",
  async (page: number) => {
    const response = await fetch(`/api/problems/list?page=${page}`);
    if (!response.ok) {
      throw new Error("Failed to fetch problems");
    }

    const data = await response.json();
    return data;
  }
);

interface ProblemsListState {
  problems: Problem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  hasMore: boolean;
  totalCount: number;
  nextPage: number;
  error: string | null;
}

const initialState: ProblemsListState = {
  problems: [],
  status: "idle",
  hasMore: true,
  totalCount: 0,
  error: null,
  nextPage: 1,
};

const problemsListSlice = createSlice({
  name: "problemsList",
  initialState,
  reducers: {
    resetProblemsList: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblemsPage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProblemsPage.fulfilled,
        (state, action: PayloadAction<ApiResponse>) => {
          state.status = "succeeded";
          state.totalCount = action.payload.totalCount;

          const existingIds = new Set(state.problems.map((p) => p.id));
          const uniqueNewProblems = action.payload.problems.filter(
            (p) => !existingIds.has(p.id)
          );
          state.problems.push(...uniqueNewProblems);

          state.nextPage += 1;
          state.hasMore = state.problems.length < state.totalCount;
        }
      )
      .addCase(fetchProblemsPage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An Unknown error occured'
      })
  },
});


export const {resetProblemsList} = problemsListSlice.actions;
export default problemsListSlice.reducer;