import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSurahVerses, fetchSurahs, fetchVerseById } from '../../api/quranApi';
import type { RootState } from '../store';
import type { Surah, Verse } from '../../api/types';

const sortVersesByApiPage = (verses: Verse[]) =>
  [...verses].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    if (a.surah_id !== b.surah_id) return a.surah_id - b.surah_id;
    return a.verse_number - b.verse_number;
  });

interface QuranState {
  surahs: Surah[];
  currentSurah: number;
  currentSurahId: number | null;
  currentVerse: Verse | null;
  verses: Verse[]; 
  allVerses: Verse[]; 
  loadedBookSurahIds: number[];
  loadingBookSurahIds: number[];
  loading: boolean;
  error: string | null;
  highlightedVerse: { surahId: number; verseNumber: number } | null;
  pendingVerseJump: { surahId: number; verseNumber: number } | null;
}

const initialState: QuranState = {
  surahs: [],
  currentSurah: 0,
  currentSurahId: null,
  currentVerse: null,
  verses: [],
  allVerses: [],
  loadedBookSurahIds: [],
  loadingBookSurahIds: [],
  loading: false,
  error: null,
  highlightedVerse: null,
  pendingVerseJump: null,
};


export const fetchAllSurahs = createAsyncThunk('quran/fetchAllSurahs', async () => {
  return await fetchSurahs();
});


export const fetchVerses = createAsyncThunk(
  'quran/fetchVerses',
  async ({ surahId, authorId }: { surahId: number; authorId?: number }) => {
    return await fetchSurahVerses(surahId, authorId);
  }
);


export const fetchVerse = createAsyncThunk(
  'quran/fetchVerse',
  async ({ surahId, verseNumber }: { surahId: number; verseNumber: number }) => {
    return await fetchVerseById(surahId, verseNumber);
  }
);


export const fetchAllVerses = createAsyncThunk(
  'quran/fetchAllVerses',
  async (authorId: number | undefined, { getState }) => {
    const state = getState() as RootState;
    const allSurahs = state.quran.surahs.length > 0 ? state.quran.surahs : await fetchSurahs();
    const allVerses: Verse[] = [];

    // Fetch surah-by-surah to avoid hammering the API with parallel requests.
    for (const surah of allSurahs) {
      const surahVerses = await fetchSurahVerses(surah.id, authorId);
      allVerses.push(...surahVerses);
    }

    return sortVersesByApiPage(allVerses);
  }
);

export const fetchBookSurahVerses = createAsyncThunk(
  'quran/fetchBookSurahVerses',
  async ({ surahId, authorId }: { surahId: number; authorId?: number }) => {
    const verses = await fetchSurahVerses(surahId, authorId);
    return { surahId, verses };
  },
  {
    condition: ({ surahId }, { getState }) => {
      const state = getState() as RootState;
      const isLoaded = state.quran.loadedBookSurahIds.includes(surahId);
      const isLoading = state.quran.loadingBookSurahIds.includes(surahId);
      return !isLoaded && !isLoading;
    },
  }
);

const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setCurrentSurah: (state, action) => {
      state.currentSurah = action.payload;
    },
    setBookCurrentSurahId: (state, action) => {
      state.currentSurahId = action.payload;
    },
    setHighlightedVerse: (state, action: { payload: { surahId: number; verseNumber: number } | null }) => {
      state.highlightedVerse = action.payload;
    },
    setPendingVerseJump: (state, action: { payload: { surahId: number; verseNumber: number } | null }) => {
      state.pendingVerseJump = action.payload;
    },
    clearPendingVerseJump: (state) => {
      state.pendingVerseJump = null;
    },
    resetBookVersesCache: (state) => {
      state.allVerses = [];
      state.loadedBookSurahIds = [];
      state.loadingBookSurahIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSurahs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllSurahs.fulfilled, (state, action) => {
        state.surahs = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllSurahs.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch surahs';
        state.loading = false;
      })

      // Handle fetchVerses
      .addCase(fetchVerses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerses.fulfilled, (state, action) => {
        state.verses = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verses';
        state.loading = false;
      })

      // Handle fetchVerse
      .addCase(fetchVerse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.currentVerse = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verse';
        state.loading = false;
      })

      // Handle fetchAllVerses
      .addCase(fetchAllVerses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVerses.fulfilled, (state, action) => {
        state.allVerses = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch all verses';
        state.loading = false;
      })

      // Handle incremental book-mode surah fetch
      .addCase(fetchBookSurahVerses.pending, (state, action) => {
        const requestedSurahId = action.meta.arg.surahId;
        if (!state.loadingBookSurahIds.includes(requestedSurahId)) {
          state.loadingBookSurahIds.push(requestedSurahId);
        }
      })
      .addCase(fetchBookSurahVerses.fulfilled, (state, action) => {
        const { surahId, verses } = action.payload;
        const withoutTargetSurah = state.allVerses.filter((v) => v.surah_id !== surahId);
        state.allVerses = sortVersesByApiPage([...withoutTargetSurah, ...verses]);
        if (!state.loadedBookSurahIds.includes(surahId)) {
          state.loadedBookSurahIds.push(surahId);
        }
        state.loadingBookSurahIds = state.loadingBookSurahIds.filter((id) => id !== surahId);
      })
      .addCase(fetchBookSurahVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch book surah verses';
        const failedSurahId = action.meta.arg.surahId;
        state.loadingBookSurahIds = state.loadingBookSurahIds.filter((id) => id !== failedSurahId);
      });
  },
});

export const { 
  setCurrentSurah, 
  setBookCurrentSurahId, 
  resetBookVersesCache, 
  setHighlightedVerse,
  setPendingVerseJump,
  clearPendingVerseJump
} = quranSlice.actions;

export const selectSurahs = (state: RootState) => state.quran.surahs;
export const selectCurrentSurah = (state: RootState) => state.quran.currentSurah;
export const selectCurrentVerse = (state: RootState) => state.quran.currentVerse;
export const selectVerses = (state: RootState) => state.quran.verses;
export const selectAllVerses = (state: RootState) => state.quran.allVerses;
export const selectLoadedBookSurahIds = (state: RootState) => state.quran.loadedBookSurahIds;
export const selectLoadingBookSurahIds = (state: RootState) => state.quran.loadingBookSurahIds;
export const selectLoading = (state: RootState) => state.quran.loading;
export const selectBookCurrentSurahId = (state: RootState) => state.quran.currentSurahId;
export const selectHighlightedVerse = (state: RootState) => state.quran.highlightedVerse;
export const selectPendingVerseJump = (state: RootState) => state.quran.pendingVerseJump;
export default quranSlice.reducer;
