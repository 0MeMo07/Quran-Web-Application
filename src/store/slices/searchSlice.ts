import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchQuran, getRandomVerse } from '../../api/quranApi';
import type { RootState } from '../store';
import type { SearchHit } from '../../api/types';

interface SearchState {
  results: SearchHit[];
  randomVerse: SearchHit | null;
  loading: boolean;
  error: string | null;
  language: string;
}

const initialState: SearchState = {
  results: [],
  randomVerse: null,
  loading: false,
  error: null,
  language: localStorage.getItem('language') || 'en',
};

export const searchVerses = createAsyncThunk<
  SearchHit[],
  { searchTerm: string; language: string },
  { rejectValue: string }
>('search/searchVerses', async ({ searchTerm, language }) => {
  const response = await searchQuran(searchTerm, language);
  return response.data.hits || [];
});

export const fetchRandomVerse = createAsyncThunk(
  'search/fetchRandomVerse',
  async (language: string) => {
    const response = await getRandomVerse(language);
    return response.data.hits[0] || null;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.randomVerse = null;
      state.loading = false;
      state.error = null;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchVerses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchVerses.fulfilled, (state, action) => {
        state.results = action.payload;
        state.loading = false;
      })
      .addCase(searchVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to search verses';
        state.loading = false;
        state.results = [];
      })
      .addCase(fetchRandomVerse.fulfilled, (state, action) => {
        state.randomVerse = action.payload;
      });
  },
});

export const { clearResults, setLanguage } = searchSlice.actions;

export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchLoading = (state: RootState) => state.search.loading;
export const selectSearchError = (state: RootState) => state.search.error;
export const selectSearchLanguage = (state: RootState) => state.search.language;
export const selectRandomVerse = (state: RootState) => state.search.randomVerse;

export default searchSlice.reducer;