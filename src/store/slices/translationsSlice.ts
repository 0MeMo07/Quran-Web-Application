import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Author } from '../../api/types';

interface TranslationsState {
  authors: Author[];
  selectedAuthor: Author | null;
}

const initialState: TranslationsState = {
  authors: [],
  selectedAuthor: null,
};

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setSelectedAuthor: (state, action) => {
      state.selectedAuthor = action.payload;
      if (action.payload) {
        localStorage.setItem('lastSelectedAuthorId', action.payload.id.toString());
      }
    },
    setAuthors: (state, action) => {
      state.authors = action.payload;
    },
  },
});

export const { setSelectedAuthor, setAuthors } = translationsSlice.actions;

export const selectAuthors = (state: RootState) => state.translations.authors;
export const selectSelectedAuthor = (state: RootState) => state.translations.selectedAuthor;

export default translationsSlice.reducer;