import { configureStore } from '@reduxjs/toolkit';
import quranReducer from './slices/quranSlice';
import translationsReducer from './slices/translationsSlice';
import uiReducer from './slices/uiSlice';
import searchReducer from './slices/searchSlice';
import { quranApi } from './services/quranApi';

export const store = configureStore({
  reducer: {
    quran: quranReducer,
    translations: translationsReducer,
    ui: uiReducer,
    search: searchReducer,
    [quranApi.reducerPath]: quranApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(quranApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;