import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Author,
  Surah,
  Verse,
  VersePart,
  RootDetail,
  RootVersesPagination,
  RootVerseItem,
  SearchResponse,
  RandomSearchResponse,
  SearchHit,
} from '../../api/types';

export const quranApi = createApi({
  reducerPath: 'quranApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.acikkuran.com' }),
  endpoints: (builder) => ({
    getSurahs: builder.query<Surah[], void>({
      query: () => '/surahs',
      transformResponse: (response: { data: Surah[] }) => response.data,
    }),
    getAuthors: builder.query<Author[], void>({
      query: () => '/authors',
      transformResponse: (response: { data: Author[] }) => response.data,
    }),
    getSurahVerses: builder.query<Verse[], { surahId: number; authorId?: number }>({
      query: ({ surahId, authorId }) => {
        const url = authorId ? `/surah/${surahId}?author=${authorId}` : `/surah/${surahId}`;
        return url;
      },
      transformResponse: (response: { data: { verses: Verse[] } }) => response.data.verses,
    }),
    getVerseById: builder.query<Verse, { surahId: number; verseNumber: number; authorId?: number }>({
      query: ({ surahId, verseNumber, authorId }) => {
        const url = authorId
          ? `/surah/${surahId}/verse/${verseNumber}?author=${authorId}`
          : `/surah/${surahId}/verse/${verseNumber}`;
        return url;
      },
      transformResponse: (response: { data: Verse }) => response.data,
    }),
    getVerseParts: builder.query<VersePart[], { surahId: number; verseNumber: number }>({
      query: ({ surahId, verseNumber }) => `/surah/${surahId}/verse/${verseNumber}/verseparts`,
      transformResponse: (response: { data: VersePart[] }) => response.data,
    }),
    getRootByLatin: builder.query<RootDetail, string>({
      query: (latin) => `/root/latin/${encodeURIComponent(latin)}`,
      transformResponse: (response: { data: RootDetail }) => response.data,
    }),
    getRootVerses: builder.query<
      { data: RootVerseItem[]; pagination: { links: RootVersesPagination['links']; meta: RootVersesPagination['meta'] } },
      { latin: string; page?: number; authorId?: number }
    >({
      query: ({ latin, page = 1, authorId }) => {
        const params = new URLSearchParams({ page: String(page) });
        if (authorId) params.set('author', String(authorId));
        return `/root/latin/${encodeURIComponent(latin)}/verses?${params.toString()}`;
      },
      transformResponse: (response: RootVersesPagination) => ({
        data: response.data,
        pagination: {
          links: response.links,
          meta: response.meta,
        },
      }),
    }),
    searchVerses: builder.query<SearchHit[], { searchTerm: string; language: string }>({
      query: ({ searchTerm, language }) => `/search?q=${encodeURIComponent(searchTerm)}&type=quick&lang=${language}`,
      transformResponse: (response: SearchResponse) => response.data.hits || [],
    }),
    getRandomVerse: builder.query<SearchHit, string>({
      query: (language) => `/random-search?lang=${language}`,
      transformResponse: (response: RandomSearchResponse) => response.data.hits[0],
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
