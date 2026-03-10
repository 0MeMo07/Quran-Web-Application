export interface Author {
  id: number;
  name: string;
  description: string;
  language: string;
  url: string | null;
}

export interface Surah {
  id: number;
  name: string;
  name_en: string;
  name_original: string;
  slug: string;
  verse_count: number;
  page_number: number;
  audio: Audio;
}

export interface Translation {
  id: number;
  text: string;
  author: Author;
  footnotes: Footnote[] | null;
}

export interface Footnote {
  id: number;
  text: string;
  number: number;
}

export interface Verse {
  data: {
    id: number;
    name: string;
    name_en: string;
    name_original: string;
    name_translation_tr: string;
    name_translation_en: string;
    slug: string;
    verse_count: number;
    page_number: number;
    audio: {
      mp3: string;
      duration: number;
      mp3_en: string;
      duration_en: number;
    };
  };
  id: number;
  surah_id: number;
  verse_number: number;
  verse: string;
  verse_simplified: string;
  page: number;
  juz_number: number;
  transcription: string;
  transcription_en: string;
  translation: Translation;
  surah: Surah;
  audio: Audio;
}

export interface Audio {
  mp3: string;
  duration: number;
  mp3_en: string;
  duration_en: number;
}

export interface SearchHit {
  id: number;
  text: string;
  verse_id: number;
  language: string;
  author: {
    id: number;
    name: string;
    language: string;
    description: string | null;
  };
  surah: {
    id: number;
    name: string;
    name_en: string;
    name_original: string;
    audio?: Audio;
  };
  verse: {
    id: number;
    page: number;
    verse: string;
    juz_number: number;
    verse_number: number;
    transcription: string;
    transcription_en: string;
  };
  _formatted?: {
    text: string;
    verse: {
      verse: string;
      transcription: string;
    };
  };
  _rankingScore?: number;
}

export interface SearchResponse {
  data: {
    hits: SearchHit[];
    estimatedTotalHits: number;
    limit: number;
    offset: number;
    processingTimeMs: number;
    query: string;
  };
}

export interface RandomSearchResponse {
  data: {
    hits: SearchHit[];
    estimatedTotalHits: number;
    limit: number;
    offset: number;
    processingTimeMs: number;
    query: string;
  };
}

export interface RootDiff {
  id: number;
  diff: string;
  count: number;
}

export interface RootDetail {
  id: number;
  latin: string;
  arabic: string;
  transcription: string;
  transcription_en: string;
  mean: string;
  mean_en: string;
  diffs: RootDiff[];
  rootchar_id: number;
}

export interface RootVerseItem {
  id: number;
  rootdiff_id: number;
  root: {
    id: number;
    latin: string;
    arabic: string;
  };
  surah: {
    id: number;
    name: string;
    slug: string;
    verse_count: number;
    page_number: number;
    name_original: string;
    audio: {
      mp3: string;
      duration: number;
    };
  };
  verse: {
    id: number;
    page: number;
    surah_id: number;
    verse_number: number;
    verse: string;
    transcription: string;
    juz_number: number;
    translation: {
      id: number;
      author: {
        id: number;
        name: string;
        description: string;
        language: string;
      };
      text: string;
      footnotes: Footnote[] | null;
    };
  };
  sort_number: number;
  arabic: string;
  transcription: string;
  turkish: string;
  prop_1: string;
  prop_2: string;
  prop_3: string;
  prop_4: string;
  prop_5: string;
  prop_6: string;
  prop_7: string;
  prop_8: string;
}

export interface VersePart {
  id: number;
  sort_number: number;
  transcription_tr: string;
  transcription_en: string;
  arabic: string;
  translation_tr: string;
  translation_en: string;
  root: {
    id: number;
    latin: string;
    arabic: string;
  } | null;
}

export interface RootVersesPagination {
  links: {
    first: string;
    prev: string;
    next: string | null;
    last: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  data: RootVerseItem[];
}