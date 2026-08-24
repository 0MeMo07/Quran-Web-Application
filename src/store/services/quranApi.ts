import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Author,
  Surah,
  Verse,
  VersePart,
  RootDetail,
  RootVersesPagination,
  RootVerseItem,
  SearchHit,
} from '../../api/types';
import {
  fetchSurahs,
  fetchAuthors,
  fetchSurahVerses,
  fetchVerseById,
  fetchVerseParts,
  fetchRootByLatin,
  fetchRootVerses,
  searchQuran,
  getRandomVerse,
} from '../../api/quranApi';

export const quranApi = createApi({
  reducerPath: 'quranApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getSurahs: builder.query<Surah[], void>({
      queryFn: async () => {
        try {
          const data = await fetchSurahs();
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch surahs',
            },
          };
        }
      },
    }),
    getAuthors: builder.query<Author[], void>({
      queryFn: async () => {
        try {
          const data = await fetchAuthors();
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch authors',
            },
          };
        }
      },
    }),
    getSurahVerses: builder.query<Verse[], { surahId: number; authorId?: number }>({
      queryFn: async ({ surahId, authorId = 1 }) => {
        try {
          const data = await fetchSurahVerses(surahId, authorId);
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch surah verses',
            },
          };
        }
      },
    }),
    getVerseById: builder.query<
      Verse,
      { surahId: number; verseNumber: number; authorId?: number }
    >({
      queryFn: async ({ surahId, verseNumber, authorId = 1 }) => {
        try {
          const data = await fetchVerseById(surahId, verseNumber, authorId);
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch verse',
            },
          };
        }
      },
    }),
    getVerseParts: builder.query<VersePart[], { surahId: number; verseNumber: number }>({
      queryFn: async ({ surahId, verseNumber }) => {
        try {
          const data = await fetchVerseParts(surahId, verseNumber);
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch verse parts',
            },
          };
        }
      },
    }),
    getRootByLatin: builder.query<RootDetail, string>({
      queryFn: async (latin) => {
        try {
          const data = await fetchRootByLatin(latin);
          return { data };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch root',
            },
          };
        }
      },
    }),
    getRootVerses: builder.query<
      {
        data: RootVerseItem[];
        pagination: { links: RootVersesPagination['links']; meta: RootVersesPagination['meta'] };
      },
      { latin: string; page?: number; authorId?: number }
    >({
      queryFn: async ({ latin, page = 1, authorId = 1 }) => {
        try {
          const res = await fetchRootVerses(latin, page, authorId);
          return {
            data: {
              data: res.data,
              pagination: {
                links: res.links,
                meta: res.meta,
              },
            },
          };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch root verses',
            },
          };
        }
      },
    }),
    searchVerses: builder.query<SearchHit[], { searchTerm: string; language: string }>({
      queryFn: async ({ searchTerm, language }) => {
        try {
          const res = await searchQuran(searchTerm, language);
          return { data: res.data.hits || [] };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to search verses',
            },
          };
        }
      },
    }),
    getRandomVerse: builder.query<SearchHit, string>({
      queryFn: async (language) => {
        try {
          const res = await getRandomVerse(language);
          return { data: res.data.hits[0] };
        } catch (err: unknown) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : 'Failed to fetch random verse',
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetSurahsQuery,
  useGetAuthorsQuery,
  useGetSurahVersesQuery,
  useLazyGetSurahVersesQuery,
  useGetVerseByIdQuery,
  useLazyGetVerseByIdQuery,
  useGetVersePartsQuery,
  useGetRootByLatinQuery,
  useGetRootVersesQuery,
  useSearchVersesQuery,
  useLazySearchVersesQuery,
  useGetRandomVerseQuery,
  useLazyGetRandomVerseQuery,
} = quranApi;
