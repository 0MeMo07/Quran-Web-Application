import type {
  Author,
  Surah,
  Verse,
  SearchResponse,
  RandomSearchResponse,
  RootDetail,
  RootVersesPagination,
  VersePart,
  SearchHit,
} from './types';
import {
  DEFAULT_AUTHORS,
  AUTHOR_EDITION_MAP,
  SURAH_TURKISH_NAMES,
  buildSurahObject,
  QURAN_CONCEPT_DICTIONARY,
} from './quranConstants';

const ALQURAN_BASE_URL = 'https://api.alquran.cloud/v1';
const QURANCOM_BASE_URL = 'https://api.quran.com/api/v4';

const surahCache = new Map<number, Surah>();
const versesCache = new Map<string, Verse[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

const BISMILLAH_PREFIX_REGEX = /^بِسْمِ[\s\S]*?رَّحِي(?:مِ|مْ|م)\s*/u;

export function cleanAyahText(text: string, surahId: number, ayahNumber: number): string {
  if (surahId === 1 || ayahNumber !== 1) {
    return text;
  }
  const cleaned = text.replace(BISMILLAH_PREFIX_REGEX, '').trim();
  return cleaned || text;
}

export async function fetchAuthors(): Promise<Author[]> {
  return DEFAULT_AUTHORS;
}

export async function fetchSurahs(): Promise<Surah[]> {
  try {
    const data = await fetchJson<{
      code: number;
      data: Array<{
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        numberOfAyahs: number;
        revelationType: string;
      }>;
    }>(`${ALQURAN_BASE_URL}/surah`);

    if (data && Array.isArray(data.data)) {
      const surahs = data.data.map((s) => {
        const obj = buildSurahObject(s.number, s.name, s.englishName);
        surahCache.set(s.number, obj);
        return obj;
      });
      return surahs;
    }
  } catch {
    // Network fallback
  }

  return Array.from({ length: 114 }, (_, i) => {
    const id = i + 1;
    const obj = buildSurahObject(id, '', SURAH_TURKISH_NAMES[id] || `Surah ${id}`);
    surahCache.set(id, obj);
    return obj;
  });
}

export async function fetchSurahVerses(surahId: number, authorId: number = 1): Promise<Verse[]> {
  const cacheKey = `${surahId}_${authorId}`;
  if (versesCache.has(cacheKey)) {
    return versesCache.get(cacheKey)!;
  }

  const author = DEFAULT_AUTHORS.find((a) => a.id === authorId) || DEFAULT_AUTHORS[0];
  const edition = AUTHOR_EDITION_MAP[authorId] || 'tr.diyanet';
  let surahMeta = surahCache.get(surahId);
  if (!surahMeta) {
    surahMeta = buildSurahObject(surahId, '', SURAH_TURKISH_NAMES[surahId] || `Surah ${surahId}`);
  }

  try {
    const url = `${ALQURAN_BASE_URL}/surah/${surahId}/editions/quran-uthmani,${edition},ar.alafasy`;
    const response = await fetchJson<{
      code: number;
      data: Array<{
        number: number;
        name: string;
        englishName: string;
        ayahs: Array<{
          number: number;
          text: string;
          numberInSurah: number;
          juz: number;
          manzil: number;
          page: number;
          ruku: number;
          hizbQuarter: number;
          sajda: boolean | object;
          audio?: string;
        }>;
      }>;
    }>(url);

    if (response && response.data && response.data.length >= 2) {
      const arabicAyahs = response.data[0]?.ayahs || [];
      const translationAyahs = response.data[1]?.ayahs || [];
      const audioAyahs = response.data[2]?.ayahs || [];

      const verses: Verse[] = arabicAyahs.map((ar, idx) => {
        const trAyah = translationAyahs[idx];
        const audAyah = audioAyahs[idx];
        const audioUrl =
          audAyah?.audio ||
          `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ar.number}.mp3`;

        const cleanedArabic = cleanAyahText(ar.text, surahId, ar.numberInSurah);

        return {
          id: surahId * 1000 + ar.numberInSurah,
          surah_id: surahId,
          verse_number: ar.numberInSurah,
          verse: cleanedArabic,
          verse_simplified: cleanedArabic,
          page: ar.page,
          juz_number: ar.juz,
          transcription: '',
          transcription_en: '',
          translation: {
            id: surahId * 1000 + ar.numberInSurah,
            text: trAyah?.text || '',
            author: author,
            footnotes: null,
          },
          surah: surahMeta!,
          audio: {
            mp3: audioUrl,
            duration: 0,
            mp3_en: '',
            duration_en: 0,
          },
          data: {
            id: surahId,
            name: surahMeta!.name,
            name_en: surahMeta!.name_en,
            name_original: surahMeta!.name_original,
            name_translation_tr: surahMeta!.name,
            name_translation_en: surahMeta!.name_en,
            slug: surahMeta!.slug,
            verse_count: surahMeta!.verse_count,
            page_number: surahMeta!.page_number,
            audio: surahMeta!.audio,
          },
        };
      });

      versesCache.set(cacheKey, verses);
      return verses;
    }
  } catch (err) {
    console.error('Al-Quran Cloud request failed, trying Quran.com fallback:', err);
  }

  // Fallback to Quran.com API v4
  try {
    const quranComTranslationId = authorId === 2 ? 52 : 77;
    const qcUrl = `${QURANCOM_BASE_URL}/verses/by_chapter/${surahId}?language=tr&translations=${quranComTranslationId}&fields=text_uthmani,chapter_id,verse_number,page_number,juz_number,verse_key&per_page=300`;
    const qcData = await fetchJson<{
      verses: Array<{
        id: number;
        verse_number: number;
        text_uthmani: string;
        page_number: number;
        juz_number: number;
        translations?: Array<{ id: number; text: string }>;
      }>;
    }>(qcUrl);

    if (qcData && qcData.verses) {
      const verses: Verse[] = qcData.verses.map((v) => {
        const cleanedArabic = cleanAyahText(v.text_uthmani, surahId, v.verse_number);
        return {
          id: surahId * 1000 + v.verse_number,
          surah_id: surahId,
          verse_number: v.verse_number,
          verse: cleanedArabic,
          verse_simplified: cleanedArabic,
        page: v.page_number,
        juz_number: v.juz_number,
        transcription: '',
        transcription_en: '',
        translation: {
          id: surahId * 1000 + v.verse_number,
          text: v.translations?.[0]?.text || '',
          author: author,
          footnotes: null,
        },
        surah: surahMeta!,
        audio: {
          mp3: `https://everyayah.com/data/Alafasy_128kbps/${String(surahId).padStart(3, '0')}${String(v.verse_number).padStart(3, '0')}.mp3`,
          duration: 0,
          mp3_en: '',
          duration_en: 0,
        },
        data: {
          id: surahId,
          name: surahMeta!.name,
          name_en: surahMeta!.name_en,
          name_original: surahMeta!.name_original,
          name_translation_tr: surahMeta!.name,
          name_translation_en: surahMeta!.name_en,
          slug: surahMeta!.slug,
          verse_count: surahMeta!.verse_count,
          page_number: surahMeta!.page_number,
          audio: surahMeta!.audio,
        },
      };
    });

      versesCache.set(cacheKey, verses);
      return verses;
    }
  } catch (qcErr) {
    console.error('Quran.com API fallback error:', qcErr);
  }

  return [];
}

export async function fetchVerseById(
  surahId: number,
  verseNumber: number,
  authorId: number = 1
): Promise<Verse> {
  const verses = await fetchSurahVerses(surahId, authorId);
  const found = verses.find((v) => v.verse_number === verseNumber);
  if (found) return found;

  if (verses.length > 0) return verses[0];
  throw new Error(`Verse not found: ${surahId}:${verseNumber}`);
}

export async function fetchVerseParts(
  surahId: number,
  verseNumber: number
): Promise<VersePart[]> {
  try {
    const url = `${QURANCOM_BASE_URL}/verses/by_key/${surahId}:${verseNumber}?language=tr&words=true&word_fields=text_uthmani,transliteration,translation`;
    const response = await fetchJson<{
      verse: {
        words: Array<{
          id: number;
          position: number;
          text_uthmani?: string;
          text?: string;
          char_type_name: string;
          translation?: { text: string };
          transliteration?: { text: string };
        }>;
      };
    }>(url);

    if (response?.verse?.words) {
      return response.verse.words
        .filter((w) => w.char_type_name === 'word' || w.text_uthmani)
        .map((w, index) => ({
          id: w.id || index + 1,
          sort_number: w.position || index + 1,
          transcription_tr: w.transliteration?.text || '',
          transcription_en: w.transliteration?.text || '',
          arabic: w.text_uthmani || w.text || '',
          translation_tr: w.translation?.text || '',
          translation_en: w.translation?.text || '',
          root: null,
        }));
    }
  } catch (err) {
    console.error('Error fetching verse parts:', err);
  }

  return [];
}

export async function searchQuran(
  query: string,
  language: string = 'tr'
): Promise<SearchResponse> {
  const edition = language === 'tr' ? 'tr.diyanet' : 'en.sahih';
  try {
    const url = `${ALQURAN_BASE_URL}/search/${encodeURIComponent(query)}/all/${edition}`;
    const res = await fetchJson<{
      code: number;
      data: {
        count: number;
        matches: Array<{
          number: number;
          text: string;
          numberInSurah: number;
          surah: {
            number: number;
            name: string;
            englishName: string;
          };
          edition: {
            name: string;
            language: string;
          };
        }>;
      };
    }>(url);

    const matches = res?.data?.matches || [];
    const hits: SearchHit[] = matches.map((m) => {
      const surahNameTr = SURAH_TURKISH_NAMES[m.surah.number] || m.surah.englishName;
      return {
        id: m.number,
        text: m.text,
        verse_id: m.surah.number * 1000 + m.numberInSurah,
        language,
        author: {
          id: 1,
          name: m.edition.name,
          language: m.edition.language,
          description: null,
        },
        surah: {
          id: m.surah.number,
          name: surahNameTr,
          name_en: m.surah.englishName,
          name_original: m.surah.name,
        },
        verse: {
          id: m.surah.number * 1000 + m.numberInSurah,
          page: 1,
          verse: '',
          juz_number: 1,
          verse_number: m.numberInSurah,
          transcription: '',
          transcription_en: '',
        },
      };
    });

    return {
      data: {
        hits,
        estimatedTotalHits: res?.data?.count || hits.length,
        limit: 50,
        offset: 0,
        processingTimeMs: 10,
        query,
      },
    };
  } catch {
    return {
      data: {
        hits: [],
        estimatedTotalHits: 0,
        limit: 50,
        offset: 0,
        processingTimeMs: 0,
        query,
      },
    };
  }
}

export async function getRandomVerse(language: string = 'tr'): Promise<RandomSearchResponse> {
  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const verses = await fetchSurahVerses(randomSurah, 1);
  const randomVerse = verses[Math.floor(Math.random() * (verses.length || 1))] || verses[0];

  const searchHit: SearchHit = {
    id: randomVerse.id,
    text: randomVerse.translation.text,
    verse_id: randomVerse.id,
    language,
    author: {
      id: 1,
      name: 'Diyanet İşleri',
      language: 'tr',
      description: null,
    },
    surah: {
      id: randomVerse.surah_id,
      name: randomVerse.surah.name,
      name_en: randomVerse.surah.name_en,
      name_original: randomVerse.surah.name_original,
      audio: randomVerse.surah.audio,
    },
    verse: {
      id: randomVerse.id,
      page: randomVerse.page,
      verse: randomVerse.verse,
      juz_number: randomVerse.juz_number,
      verse_number: randomVerse.verse_number,
      transcription: randomVerse.transcription,
      transcription_en: randomVerse.transcription_en,
    },
  };

  return {
    data: {
      hits: [searchHit],
      estimatedTotalHits: 1,
      limit: 1,
      offset: 0,
      processingTimeMs: 10,
      query: '',
    },
  };
}

export function sanitizeLatinSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/[^a-z]/g, '');
}

export async function fetchRootByLatin(latin: string): Promise<RootDetail> {
  const clean = sanitizeLatinSlug(latin);
  const concept = QURAN_CONCEPT_DICTIONARY[clean];

  return {
    id: Math.abs(clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
    latin: clean,
    arabic: '',
    transcription: concept?.tr || clean.toUpperCase(),
    transcription_en: concept?.en || clean.toUpperCase(),
    mean: concept?.tr || clean,
    mean_en: concept?.en || clean,
    diffs: [
      { id: 1, diff: clean, count: 12 },
      { id: 2, diff: `${clean}a`, count: 8 },
    ],
    rootchar_id: 1,
  };
}

export async function fetchRootVerses(
  latin: string,
  page: number = 1,
  authorId: number = 1
): Promise<RootVersesPagination> {
  const clean = sanitizeLatinSlug(latin);
  const concept = QURAN_CONCEPT_DICTIONARY[clean];
  const query = concept?.tr || clean;

  const searchRes = await searchQuran(query, 'tr');
  const hits = searchRes.data.hits.slice((page - 1) * 10, page * 10);
  const author = DEFAULT_AUTHORS.find((a) => a.id === authorId) || DEFAULT_AUTHORS[0];

  return {
    links: {
      first: `?page=1`,
      prev: page > 1 ? `?page=${page - 1}` : '',
      next: searchRes.data.hits.length > page * 10 ? `?page=${page + 1}` : null,
      last: `?page=${Math.ceil(searchRes.data.hits.length / 10)}`,
    },
    meta: {
      current_page: page,
      from: (page - 1) * 10 + 1,
      last_page: Math.max(1, Math.ceil(searchRes.data.hits.length / 10)),
      path: '/root/verses',
      per_page: 10,
      to: Math.min(page * 10, searchRes.data.hits.length),
      total: searchRes.data.hits.length,
    },
    data: hits.map((hit, idx) => ({
      id: hit.id,
      rootdiff_id: 1,
      root: { id: 1, latin: clean, arabic: '' },
      surah: {
        id: hit.surah.id,
        name: hit.surah.name,
        slug: hit.surah.name.toLowerCase(),
        verse_count: 7,
        page_number: 1,
        name_original: hit.surah.name_original,
        audio: { mp3: '', duration: 0 },
      },
      verse: {
        id: hit.verse_id,
        page: hit.verse.page,
        surah_id: hit.surah.id,
        verse_number: hit.verse.verse_number,
        verse: hit.verse.verse,
        transcription: hit.verse.transcription,
        juz_number: hit.verse.juz_number,
        translation: {
          id: hit.id,
          author,
          text: hit.text,
          footnotes: null,
        },
      },
      sort_number: idx + 1,
      arabic: '',
      transcription: '',
      turkish: hit.text,
      prop_1: '',
      prop_2: '',
      prop_3: '',
      prop_4: '',
      prop_5: '',
      prop_6: '',
      prop_7: '',
      prop_8: '',
    })),
  };
}

export async function fetchRootsList(): Promise<
  { id: number; root: string; latin: string; mean: string; mean_en: string }[]
> {
  return Object.entries(QURAN_CONCEPT_DICTIONARY).map(([key, val], idx) => ({
    id: idx + 1,
    root: key,
    latin: key,
    mean: val.tr,
    mean_en: val.en,
  }));
}
