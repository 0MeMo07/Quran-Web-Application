import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type ReadingType = 'card' | 'book' | 'detail';
export type ViewType = 'meal' | 'meal+kuran' | 'kuran+meal' | 'kuran';

export interface Note {
  id: string;
  verseId: number;
  surahId: number;
  surahName: string;
  content: string;
  createdAt: string;
}

interface UIState {
  isDarkMode: boolean;
  language: 'tr' | 'en';
  readingType: ReadingType;
  viewType: ViewType;
  notes: Note[];
}

const savedTheme = localStorage.getItem('isDarkMode');
const savedLanguage = localStorage.getItem('language');
const savedReadingType = localStorage.getItem('readingType');
const savedViewType = localStorage.getItem('viewType');
const savedNotes = localStorage.getItem('quran-notes');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: UIState = {
  isDarkMode: savedTheme ? JSON.parse(savedTheme) : prefersDarkMode,
  language: savedLanguage as 'tr' | 'en' || 'en',
  readingType: (savedReadingType as ReadingType) || 'book',
  viewType: (savedViewType as ViewType) || 'meal',
  notes: savedNotes ? JSON.parse(savedNotes) : [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
      
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    toggleLanguage: (state) => {
      const newLanguage = state.language === 'tr' ? 'en' : 'tr';
      state.language = newLanguage;
      localStorage.setItem('language', newLanguage);
    },
    setReadingType: (state, action: PayloadAction<ReadingType>) => {
      state.readingType = action.payload;
      localStorage.setItem('readingType', action.payload);
    },
    setViewType: (state, action: PayloadAction<ViewType>) => {
      state.viewType = action.payload;
      localStorage.setItem('viewType', action.payload);
    },
    addNote: (state, action: PayloadAction<Note>) => {
      const noteIndex = state.notes.findIndex(
        note => note.surahId === action.payload.surahId && note.verseId === action.payload.verseId
      );

      if (noteIndex !== -1) {
        state.notes[noteIndex] = action.payload;
      } else {
        state.notes.push(action.payload);
      }

      localStorage.setItem('quran-notes', JSON.stringify(state.notes));
    },
    deleteNote: (state, action: PayloadAction<{ surahId: number; verseId: number }>) => {
      state.notes = state.notes.filter(
        note => !(note.surahId === action.payload.surahId && note.verseId === action.payload.verseId)
      );
      
      localStorage.setItem('quran-notes', JSON.stringify(state.notes));
    },
  },
});

if (initialState.isDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const { 
  toggleTheme, 
  setLanguage, 
  toggleLanguage,
  setReadingType,
  setViewType,
  addNote,
  deleteNote
} = uiSlice.actions;

export const selectIsDarkMode = (state: RootState) => state.ui.isDarkMode;
export const selectLanguage = (state: RootState) => state.ui.language;
export const selectReadingType = (state: RootState) => state.ui.readingType;
export const selectViewType = (state: RootState) => state.ui.viewType;
export const selectNotes = (state: RootState) => state.ui.notes;

export const selectNoteByVerseAndSurah = (state: RootState, surahId: number, verseId: number) => 
  state.ui.notes.find(note => note.surahId === surahId && note.verseId === verseId);

export const selectTheme = (state: RootState) => state.ui.isDarkMode ? 'dark' : 'light';

export default uiSlice.reducer;