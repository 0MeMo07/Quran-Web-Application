import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Surah, Verse } from '../../api/types';

interface QuranState {
  surahs: Surah[];
  currentSurah: number;
  currentSurahId: number | null;
  currentVerse: Verse | null;
  verses: Verse[]; 
  allVerses: Verse[]; 
  loadedBookSurahIds: number[];
  loadingBookSurahIds: number[];
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
  highlightedVerse: null,
  pendingVerseJump: null,
};

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
    setSurahs: (state, action) => {
      state.surahs = action.payload;
    },
    setVerses: (state, action) => {
      state.verses = action.payload;
    },
    setAllVerses: (state, action) => {
      state.allVerses = action.payload;
    },
    setCurrentVerse: (state, action) => {
      state.currentVerse = action.payload;
    },
    addLoadedBookSurahId: (state, action: { payload: number }) => {
      if (!state.loadedBookSurahIds.includes(action.payload)) {
        state.loadedBookSurahIds.push(action.payload);
      }
    },
    addLoadingBookSurahId: (state, action: { payload: number }) => {
      if (!state.loadingBookSurahIds.includes(action.payload)) {
        state.loadingBookSurahIds.push(action.payload);
      }
    },
    removeLoadingBookSurahId: (state, action: { payload: number }) => {
      state.loadingBookSurahIds = state.loadingBookSurahIds.filter((id) => id !== action.payload);
    },
  },
});

export const { 
  setCurrentSurah, 
  setBookCurrentSurahId, 
  resetBookVersesCache, 
  setHighlightedVerse,
  setPendingVerseJump,
  clearPendingVerseJump,
  setSurahs,
  setVerses,
  setAllVerses,
  setCurrentVerse,
  addLoadedBookSurahId,
  addLoadingBookSurahId,
  removeLoadingBookSurahId,
} = quranSlice.actions;

export const selectSurahs = (state: RootState) => state.quran.surahs;
export const selectCurrentSurah = (state: RootState) => state.quran.currentSurah;
export const selectCurrentVerse = (state: RootState) => state.quran.currentVerse;
export const selectVerses = (state: RootState) => state.quran.verses;
export const selectAllVerses = (state: RootState) => state.quran.allVerses;
export const selectLoadedBookSurahIds = (state: RootState) => state.quran.loadedBookSurahIds;
export const selectLoadingBookSurahIds = (state: RootState) => state.quran.loadingBookSurahIds;
export const selectBookCurrentSurahId = (state: RootState) => state.quran.currentSurahId;
export const selectHighlightedVerse = (state: RootState) => state.quran.highlightedVerse;
export const selectPendingVerseJump = (state: RootState) => state.quran.pendingVerseJump;

export default quranSlice.reducer;
