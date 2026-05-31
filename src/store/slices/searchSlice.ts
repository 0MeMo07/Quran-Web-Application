import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { SearchHit } from '../../api/types';

interface SearchState {
  results: SearchHit[];
  randomVerse: SearchHit | null;
}

const initialState: SearchState = {
  results: [],
  randomVerse: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.randomVerse = null;
    },
    setSearchResults: (state, action) => {
      state.results = action.payload;
    },
    setRandomVerse: (state, action) => {
      state.randomVerse = action.payload;
    },
  },
});

export const { clearResults, setSearchResults, setRandomVerse } = searchSlice.actions;

export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchLanguage = (state: RootState) => state.ui.language;
export const selectRandomVerse = (state: RootState) => state.search.randomVerse;

export default searchSlice.reducer;