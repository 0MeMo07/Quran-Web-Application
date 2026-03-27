import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type ReadingType = 'card' | 'book' | 'detail';
export type ViewType = 'meal' | 'meal+kuran' | 'kuran+meal' | 'kuran';
export type VisualTheme = 'default' | 'simple';
export type BookLayoutType = 'standard' | 'pageflip';

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
  visualTheme: VisualTheme;
  language: 'tr' | 'en';
  readingType: ReadingType;
  viewType: ViewType;
  bookLayoutType: BookLayoutType;
  notes: Note[];
}

const savedTheme = localStorage.getItem('isDarkMode');
const savedVisualTheme = localStorage.getItem('visualTheme');
const savedLanguage = localStorage.getItem('language');
const savedReadingType = localStorage.getItem('readingType');
const savedViewType = localStorage.getItem('viewType');
const savedBookLayoutType = localStorage.getItem('bookLayoutType');
const savedNotes = localStorage.getItem('quran-notes');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: UIState = {
  isDarkMode: savedTheme ? JSON.parse(savedTheme) : prefersDarkMode,
  visualTheme: (savedVisualTheme as VisualTheme) || 'default',
  language: (savedLanguage as 'tr' | 'en') || 'en',
  readingType: (savedReadingType as ReadingType) || 'book',
  viewType: (savedViewType as ViewType) || 'meal',
  bookLayoutType: (savedBookLayoutType as BookLayoutType) || 'standard',
  notes: savedNotes ? JSON.parse(savedNotes) : [],
};

const applyThemeClasses = (isDarkMode: boolean, visualTheme: VisualTheme) => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (visualTheme === 'simple') {
    document.documentElement.classList.add('simple-theme');
  } else {
    document.documentElement.classList.remove('simple-theme');
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));

      applyThemeClasses(state.isDarkMode, state.visualTheme);
    },
    setVisualTheme: (state, action: PayloadAction<VisualTheme>) => {
      state.visualTheme = action.payload;
      localStorage.setItem('visualTheme', action.payload);

      applyThemeClasses(state.isDarkMode, state.visualTheme);
    },
    setTheme: (state, action: PayloadAction<{ isDarkMode: boolean, visualTheme: VisualTheme }>) => {
      state.isDarkMode = action.payload.isDarkMode;
      state.visualTheme = action.payload.visualTheme;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
      localStorage.setItem('visualTheme', state.visualTheme);

      applyThemeClasses(state.isDarkMode, state.visualTheme);
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
    setBookLayoutType: (state, action: PayloadAction<BookLayoutType>) => {
      state.bookLayoutType = action.payload;
      localStorage.setItem('bookLayoutType', action.payload);
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

applyThemeClasses(initialState.isDarkMode, initialState.visualTheme);

export const { 
  toggleTheme, 
  setVisualTheme,
  setTheme,
  setLanguage, 
  toggleLanguage,
  setReadingType,
  setViewType,
  setBookLayoutType,
  addNote,
  deleteNote
} = uiSlice.actions;

export const selectIsDarkMode = (state: RootState) => state.ui.isDarkMode;
export const selectVisualTheme = (state: RootState) => state.ui.visualTheme;
export const selectLanguage = (state: RootState) => state.ui.language;
export const selectReadingType = (state: RootState) => state.ui.readingType;
export const selectViewType = (state: RootState) => state.ui.viewType;
export const selectBookLayoutType = (state: RootState) => state.ui.bookLayoutType;
export const selectNotes = (state: RootState) => state.ui.notes;

export const selectNoteByVerseAndSurah = (state: RootState, surahId: number, verseId: number) => 
  state.ui.notes.find(note => note.surahId === surahId && note.verseId === verseId);

export const selectTheme = (state: RootState) => state.ui.isDarkMode ? 'dark' : 'light';

export default uiSlice.reducer;