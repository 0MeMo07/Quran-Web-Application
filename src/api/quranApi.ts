import { Author, Surah, Verse, SearchResponse, RandomSearchResponse, RootDetail, RootVersesPagination, VersePart } from './types';

const BASE_URL = 'https://api.acikkuran.com';


async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchAuthors(): Promise<Author[]> {
  const data = await fetchData<{ data: Author[] }>(`${BASE_URL}/authors`);
  return data.data;
}

export async function searchQuran(query: string, language: string = 'en'): Promise<SearchResponse> {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=quick&lang=${language}`;
  return fetchData<SearchResponse>(url);
}
export async function getRandomVerse(language: string = 'en'): Promise<RandomSearchResponse> {
  const url = `${BASE_URL}/random-search?lang=${language}`;
  return fetchData<RandomSearchResponse>(url);
}

export async function fetchSurahs(): Promise<Surah[]> {
  const data = await fetchData<{ data: Surah[] }>(`${BASE_URL}/surahs`);
  return data.data;
}

export async function fetchSurahVerses(surahId: number, authorId?: number): Promise<Verse[]> {
  const url = authorId
    ? `${BASE_URL}/surah/${surahId}?author=${authorId}`
    : `${BASE_URL}/surah/${surahId}`;
  const data = await fetchData<{ data: { verses: Verse[] } }>(url);
  return data.data.verses;
}

export async function fetchVerseById(surahId: number, verseNumber: number, authorId?: number): Promise<Verse> {
  const url = authorId
    ? `${BASE_URL}/surah/${surahId}/verse/${verseNumber}?author=${authorId}`
    : `${BASE_URL}/surah/${surahId}/verse/${verseNumber}`;
  const data = await fetchData<{ data: Verse }>(url);
  return data.data;
}

export async function fetchVerseParts(surahId: number, verseNumber: number): Promise<VersePart[]> {
  const data = await fetchData<{ data: VersePart[] }>(`${BASE_URL}/surah/${surahId}/verse/${verseNumber}/verseparts`);
  return data.data;
}

export async function fetchRootByLatin(latin: string): Promise<RootDetail> {
  const data = await fetchData<{ data: RootDetail }>(`${BASE_URL}/root/latin/${encodeURIComponent(latin)}`);
  return data.data;
}

export async function fetchRootVerses(latin: string, page: number = 1, authorId?: number): Promise<RootVersesPagination> {
  const params = new URLSearchParams({ page: String(page) });
  if (authorId) params.set('author', String(authorId));
  const url = `${BASE_URL}/root/latin/${encodeURIComponent(latin)}/verses?${params.toString()}`;
  return fetchData<RootVersesPagination>(url);
}
