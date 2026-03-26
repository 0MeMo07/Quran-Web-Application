import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAuthors } from '../../api/quranApi';
import type { RootState } from '../store';
import type { Author } from '../../api/types';

interface TranslationsState {
  authors: Author[];
  selectedAuthor: Author | null;
  loading: boolean;
  error: string | null;
}

const initialState: TranslationsState = {
  authors: [],
  selectedAuthor: null,
  loading: false,
  error: null,
};

export const fetchAllAuthors = createAsyncThunk(
  'translations/fetchAuthors',
  async () => {
    const authors = await fetchAuthors();
    const currentLanguage = localStorage.getItem('language') || 'en';
    const lastSelectedAuthorId = localStorage.getItem('lastSelectedAuthorId');
    
    let defaultAuthor;
    if (lastSelectedAuthorId) {
      defaultAuthor = authors.find(author => author.id === Number(lastSelectedAuthorId));
    }
    if (!defaultAuthor) {
      defaultAuthor = authors.find(author => author.language === currentLanguage);
    }
    
    return { authors, defaultAuthor };
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAuthors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAuthors.fulfilled, (state, action) => {
        state.authors = action.payload.authors;
        if (!state.selectedAuthor && action.payload.defaultAuthor) {
          state.selectedAuthor = action.payload.defaultAuthor;
        }
        state.loading = false;
      })
      .addCase(fetchAllAuthors.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch authors';
        state.loading = false;
      });
  },
});

export const { setSelectedAuthor } = translationsSlice.actions;

export const selectAuthors = (state: RootState) => state.translations.authors;
export const selectSelectedAuthor = (state: RootState) => state.translations.selectedAuthor;
export const selectTranslationsLoading = (state: RootState) => state.translations.loading;

export default translationsSlice.reducer;