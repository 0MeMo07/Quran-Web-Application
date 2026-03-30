import type { Surah, Verse } from '../../../../api/types';
import type { ViewType } from '../../../../store/slices/uiSlice';

const SAFE_AREA_GUARD_PX = 1;
const DEFAULT_SAFE_INSETS: MushafSafeAreaInsets = {
  top: 20,
  right: 22,
  bottom: 38,
  left: 22,
};

const DEFAULT_BASMALA = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّح۪يمِ';

const widthCache = new Map<string, number>();
const wrappedLinesCache = new Map<string, string[]>();

interface SegmentLike {
  segment: string;
}

interface SegmenterLike {
  segment: (text: string) => Iterable<SegmentLike>;
}

const intlWithOptionalSegmenter = Intl as unknown as {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: 'grapheme' },
  ) => SegmenterLike;
};

const graphemeSegmenter = intlWithOptionalSegmenter.Segmenter
  ? new intlWithOptionalSegmenter.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

interface TextMeasureContext {
  measureTextWidth: (text: string, font: string) => number;
}

interface PaginationMetrics {
  showArabic: boolean;
  showTranslation: boolean;
  arabicFontFamily: string;
  translationFontFamily: string;
  headerFontFamily: string;
  arabicFontSize: number;
  arabicLineHeightPx: number;
  translationFontSize: number;
  translationLineHeightPx: number;
  headerTitleFontSize: number;
  headerTitleLineHeightPx: number;
  headerSubtitleFontSize: number;
  headerSubtitleLineHeightPx: number;
  basmalaFontSize: number;
  basmalaLineHeightPx: number;
  headerPaddingYPx: number;
  headerSectionGapPx: number;
  versePaddingYPx: number;
  sectionGapPx: number;
  blockGapPx: number;
  minRemainingPx: number;
  fillTargetMin: number;
  fillTargetMax: number;
}

interface PreparedBlockBase {
  id: string;
  kind: 'surah-header' | 'verse';
  surahId: number;
  anchorPage: number;
  heightPx: number;
}

export interface MushafSurahHeaderItem extends PreparedBlockBase {
  kind: 'surah-header';
  titleLines: string[];
  subtitleLines: string[];
  basmalaLines: string[];
}

export interface MushafVerseItem extends PreparedBlockBase {
  kind: 'verse';
  verseId: number;
  verseNumber: number;
  arabicLines: string[];
  translationLines: string[];
  continuationFromPrevious: boolean;
  continuationToNext: boolean;
}

export type MushafPageItem = MushafSurahHeaderItem | MushafVerseItem;

interface WorkingPage {
  pageNumber: number;
  items: MushafPageItem[];
  usedHeightPx: number;
}

export interface MushafSafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MushafSafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface MushafTypographySnapshot {
  arabicFontFamily: string;
  translationFontFamily: string;
  headerFontFamily: string;
  arabicFontSize: number;
  arabicLineHeightPx: number;
  translationFontSize: number;
  translationLineHeightPx: number;
  headerTitleFontSize: number;
  headerTitleLineHeightPx: number;
  headerSubtitleFontSize: number;
  headerSubtitleLineHeightPx: number;
  basmalaFontSize: number;
  basmalaLineHeightPx: number;
  headerPaddingYPx: number;
  headerSectionGapPx: number;
  versePaddingYPx: number;
  sectionGapPx: number;
  blockGapPx: number;
}

export interface MushafPageLayout {
  pageNumber: number;
  items: MushafPageItem[];
  safeArea: MushafSafeArea;
  typography: MushafTypographySnapshot;
  usedHeightPx: number;
  renderGapPx: number;
  underfillPx: number;
  overflowPx: number;
  fillRatio: number;
}

export interface BuildPageMapInput {
  verses: Verse[];
  surahs: Surah[];
  pageWidth: number;
  pageHeight: number;
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
  safeInsets?: Partial<MushafSafeAreaInsets>;
}

export interface MushafPaginationResult {
  pagesByNumber: Map<number, MushafPageLayout>;
  maxPageNumber: number;
  safeArea: MushafSafeArea;
  safeInsets: MushafSafeAreaInsets;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function splitToGraphemes(text: string): string[] {
  if (!text) {
    return [];
  }

  if (graphemeSegmenter) {
    return [...graphemeSegmenter.segment(text)].map((segment) => segment.segment);
  }

  return Array.from(text);
}

function parsePxFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  if (!match) {
    return 16;
  }

  return Number(match[1]);
}

function createTextMeasureContext(): TextMeasureContext {
  if (typeof document === 'undefined') {
    return {
      measureTextWidth: (text, font) => {
        const fontSize = parsePxFontSize(font);
        return splitToGraphemes(text).length * fontSize * 0.56;
      },
    };
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return {
      measureTextWidth: (text, font) => {
        const fontSize = parsePxFontSize(font);
        return splitToGraphemes(text).length * fontSize * 0.56;
      },
    };
  }

  return {
    measureTextWidth: (text, font) => {
      const cacheKey = `${font}__${text}`;
      const cached = widthCache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      context.font = font;
      const measured = context.measureText(text).width;
      widthCache.set(cacheKey, measured);
      return measured;
    },
  };
}

function splitLongToken(token: string, maxWidth: number, font: string, measure: TextMeasureContext): string[] {
  if (!token) {
    return [];
  }

  if (measure.measureTextWidth(token, font) <= maxWidth) {
    return [token];
  }

  const graphemes = splitToGraphemes(token);
  const pieces: string[] = [];
  let current = '';

  for (const grapheme of graphemes) {
    const candidate = current + grapheme;
    if (!current || measure.measureTextWidth(candidate, font) <= maxWidth) {
      current = candidate;
      continue;
    }

    pieces.push(current);
    current = grapheme;
  }

  if (current) {
    pieces.push(current);
  }

  return pieces;
}

function wrapTextToLines(text: string, maxWidth: number, font: string, measure: TextMeasureContext): string[] {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const cacheKey = `${font}__${maxWidth}__${normalized}`;
  const cached = wrappedLinesCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const tokens = normalized.split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (measure.measureTextWidth(candidate, font) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = '';
    }

    if (measure.measureTextWidth(token, font) <= maxWidth) {
      current = token;
      continue;
    }

    const splitPieces = splitLongToken(token, maxWidth, font, measure);
    for (let i = 0; i < splitPieces.length; i += 1) {
      const piece = splitPieces[i];
      if (i === splitPieces.length - 1) {
        current = piece;
      } else {
        lines.push(piece);
      }
    }
  }

  if (current) {
    lines.push(current);
  }

  wrappedLinesCache.set(cacheKey, lines);
  return lines;
}

function isArabicEnabled(viewType: ViewType): boolean {
  return viewType === 'kuran' || viewType === 'meal+kuran' || viewType === 'kuran+meal';
}

function isTranslationEnabled(viewType: ViewType): boolean {
  return viewType === 'meal' || viewType === 'meal+kuran' || viewType === 'kuran+meal';
}

function createPaginationMetrics(viewType: ViewType, fontSize: number, lineHeight: number): PaginationMetrics {
  const translationFontSize = clamp(fontSize, 12, 28);
  const translationLineHeightPx = roundToSingleDecimal(translationFontSize * clamp(lineHeight, 1.15, 2.25));

  const arabicFontSize = clamp(Math.round(translationFontSize * 1.75), 22, 46);
  const arabicLineHeightPx = roundToSingleDecimal(
    arabicFontSize * Math.max(1.45, clamp(lineHeight, 1.15, 2.25) * 1.06),
  );

  const headerTitleFontSize = clamp(Math.round(arabicFontSize * 0.72), 18, 34);
  const headerTitleLineHeightPx = roundToSingleDecimal(headerTitleFontSize * 1.25);

  const headerSubtitleFontSize = clamp(Math.round(translationFontSize * 0.95), 13, 24);
  const headerSubtitleLineHeightPx = roundToSingleDecimal(headerSubtitleFontSize * 1.35);

  const basmalaFontSize = clamp(Math.round(arabicFontSize * 0.7), 18, 32);
  const basmalaLineHeightPx = roundToSingleDecimal(basmalaFontSize * 1.45);

  return {
    showArabic: isArabicEnabled(viewType),
    showTranslation: isTranslationEnabled(viewType),
    arabicFontFamily: 'Scheherazade New, Noto Naskh Arabic, serif',
    translationFontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
    headerFontFamily: 'Cormorant Garamond, serif',
    arabicFontSize,
    arabicLineHeightPx,
    translationFontSize,
    translationLineHeightPx,
    headerTitleFontSize,
    headerTitleLineHeightPx,
    headerSubtitleFontSize,
    headerSubtitleLineHeightPx,
    basmalaFontSize,
    basmalaLineHeightPx,
    headerPaddingYPx: clamp(Math.round(translationFontSize * 0.75), 8, 18),
    headerSectionGapPx: clamp(Math.round(translationFontSize * 0.5), 6, 14),
    versePaddingYPx: clamp(Math.round(translationFontSize * 0.3), 4, 10),
    sectionGapPx: clamp(Math.round(translationFontSize * 0.55), 6, 16),
    blockGapPx: clamp(Math.round(translationFontSize * 0.5), 6, 16),
    minRemainingPx: clamp(Math.round(translationFontSize * 0.9), 10, 28),
    fillTargetMin: 0.95,
    fillTargetMax: 0.99,
  };
}

function createSafeInsets(overrides?: Partial<MushafSafeAreaInsets>): MushafSafeAreaInsets {
  return {
    top: overrides?.top ?? DEFAULT_SAFE_INSETS.top,
    right: overrides?.right ?? DEFAULT_SAFE_INSETS.right,
    bottom: overrides?.bottom ?? DEFAULT_SAFE_INSETS.bottom,
    left: overrides?.left ?? DEFAULT_SAFE_INSETS.left,
  };
}

function createSafeArea(
  pageWidth: number,
  pageHeight: number,
  insets: MushafSafeAreaInsets,
): MushafSafeArea {
  const top = insets.top + SAFE_AREA_GUARD_PX;
  const left = insets.left + SAFE_AREA_GUARD_PX;
  const right = insets.right + SAFE_AREA_GUARD_PX;
  const bottom = insets.bottom + SAFE_AREA_GUARD_PX;

  return {
    top,
    left,
    right,
    bottom,
    width: Math.max(120, pageWidth - left - right),
    height: Math.max(120, pageHeight - top - bottom),
  };
}

function createTypographySnapshot(metrics: PaginationMetrics): MushafTypographySnapshot {
  return {
    arabicFontFamily: metrics.arabicFontFamily,
    translationFontFamily: metrics.translationFontFamily,
    headerFontFamily: metrics.headerFontFamily,
    arabicFontSize: metrics.arabicFontSize,
    arabicLineHeightPx: metrics.arabicLineHeightPx,
    translationFontSize: metrics.translationFontSize,
    translationLineHeightPx: metrics.translationLineHeightPx,
    headerTitleFontSize: metrics.headerTitleFontSize,
    headerTitleLineHeightPx: metrics.headerTitleLineHeightPx,
    headerSubtitleFontSize: metrics.headerSubtitleFontSize,
    headerSubtitleLineHeightPx: metrics.headerSubtitleLineHeightPx,
    basmalaFontSize: metrics.basmalaFontSize,
    basmalaLineHeightPx: metrics.basmalaLineHeightPx,
    headerPaddingYPx: metrics.headerPaddingYPx,
    headerSectionGapPx: metrics.headerSectionGapPx,
    versePaddingYPx: metrics.versePaddingYPx,
    sectionGapPx: metrics.sectionGapPx,
    blockGapPx: metrics.blockGapPx,
  };
}

function sortVersesForPagination(verses: Verse[]): Verse[] {
  return [...verses].sort((a, b) => {
    if (a.page !== b.page) {
      return a.page - b.page;
    }
    if (a.surah_id !== b.surah_id) {
      return a.surah_id - b.surah_id;
    }
    return a.verse_number - b.verse_number;
  });
}

function calculateHeaderHeight(
  titleLines: string[],
  subtitleLines: string[],
  basmalaLines: string[],
  metrics: PaginationMetrics,
): number {
  let total = metrics.headerPaddingYPx * 2;

  if (titleLines.length > 0) {
    total += titleLines.length * metrics.headerTitleLineHeightPx;
  }

  if (subtitleLines.length > 0) {
    if (titleLines.length > 0) {
      total += metrics.headerSectionGapPx;
    }
    total += subtitleLines.length * metrics.headerSubtitleLineHeightPx;
  }

  if (basmalaLines.length > 0) {
    if (titleLines.length > 0 || subtitleLines.length > 0) {
      total += metrics.headerSectionGapPx;
    }
    total += basmalaLines.length * metrics.basmalaLineHeightPx;
  }

  return roundToSingleDecimal(total);
}

function calculateVerseHeight(
  arabicLines: string[],
  translationLines: string[],
  metrics: PaginationMetrics,
): number {
  let total = metrics.versePaddingYPx * 2;

  if (arabicLines.length > 0) {
    total += arabicLines.length * metrics.arabicLineHeightPx;
  }

  if (translationLines.length > 0) {
    if (arabicLines.length > 0) {
      total += metrics.sectionGapPx;
    }
    total += translationLines.length * metrics.translationLineHeightPx;
  }

  return roundToSingleDecimal(total);
}

function createSurahHeaderBlock(
  firstVerseOfSurah: Verse,
  surahById: Map<number, Surah>,
  safeArea: MushafSafeArea,
  metrics: PaginationMetrics,
  measure: TextMeasureContext,
): MushafSurahHeaderItem {
  const surah = surahById.get(firstVerseOfSurah.surah_id);
  const titleText = normalizeText(surah?.name_original || `Surah ${firstVerseOfSurah.surah_id}`);
  const subtitleText = normalizeText(
    `${surah?.id ?? firstVerseOfSurah.surah_id}. ${surah?.name ?? ''}`,
  );

  const includeBasmala = firstVerseOfSurah.verse_number === 1 && firstVerseOfSurah.surah_id !== 1 && firstVerseOfSurah.surah_id !== 9;

  const titleFont = `700 ${metrics.headerTitleFontSize}px ${metrics.headerFontFamily}`;
  const subtitleFont = `500 ${metrics.headerSubtitleFontSize}px ${metrics.translationFontFamily}`;
  const basmalaFont = `600 ${metrics.basmalaFontSize}px ${metrics.arabicFontFamily}`;

  const wrapWidth = Math.max(80, safeArea.width - 10);
  const titleLines = wrapTextToLines(titleText, wrapWidth, titleFont, measure);
  const subtitleLines = subtitleText
    ? wrapTextToLines(subtitleText, wrapWidth, subtitleFont, measure)
    : [];
  const basmalaLines = includeBasmala
    ? wrapTextToLines(DEFAULT_BASMALA, wrapWidth, basmalaFont, measure)
    : [];

  return {
    id: `surah-header-${firstVerseOfSurah.surah_id}`,
    kind: 'surah-header',
    surahId: firstVerseOfSurah.surah_id,
    anchorPage: Math.max(1, firstVerseOfSurah.page),
    titleLines,
    subtitleLines,
    basmalaLines,
    heightPx: calculateHeaderHeight(titleLines, subtitleLines, basmalaLines, metrics),
  };
}

function createVerseBlock(
  verse: Verse,
  safeArea: MushafSafeArea,
  metrics: PaginationMetrics,
  measure: TextMeasureContext,
): MushafVerseItem {
  const arabicFont = `600 ${metrics.arabicFontSize}px ${metrics.arabicFontFamily}`;
  const translationFont = `500 ${metrics.translationFontSize}px ${metrics.translationFontFamily}`;

  const wrapWidth = Math.max(80, safeArea.width - 8);

  const arabicText = metrics.showArabic
    ? normalizeText(`${verse.verse}${metrics.showTranslation ? '' : ` ${verse.verse_number}`}`)
    : '';

  const translationSource = normalizeText(verse.translation?.text || '');
  const translationText = metrics.showTranslation
    ? normalizeText(`${translationSource}${translationSource ? ' ' : ''}[${verse.verse_number}]`)
    : '';

  const arabicLines = arabicText ? wrapTextToLines(arabicText, wrapWidth, arabicFont, measure) : [];
  const translationLines = translationText
    ? wrapTextToLines(translationText, wrapWidth, translationFont, measure)
    : [];

  return {
    id: `verse-${verse.id}`,
    kind: 'verse',
    surahId: verse.surah_id,
    verseId: verse.id,
    verseNumber: verse.verse_number,
    anchorPage: Math.max(1, verse.page),
    arabicLines,
    translationLines,
    continuationFromPrevious: false,
    continuationToNext: false,
    heightPx: calculateVerseHeight(arabicLines, translationLines, metrics),
  };
}

export function prepareVerseBlocks(
  verses: Verse[],
  surahs: Surah[],
  safeArea: MushafSafeArea,
  metrics: PaginationMetrics,
  measure: TextMeasureContext,
): MushafPageItem[] {
  if (verses.length === 0) {
    return [];
  }

  const sortedVerses = sortVersesForPagination(verses);
  const surahById = new Map<number, Surah>(surahs.map((surah) => [surah.id, surah]));
  const blocks: MushafPageItem[] = [];

  let previousSurahId: number | null = null;

  for (const verse of sortedVerses) {
    if (verse.surah_id !== previousSurahId) {
      blocks.push(createSurahHeaderBlock(verse, surahById, safeArea, metrics, measure));
      previousSurahId = verse.surah_id;
    }

    blocks.push(createVerseBlock(verse, safeArea, metrics, measure));
  }

  return blocks;
}

function cloneVerseBlockWithLines(
  block: MushafVerseItem,
  arabicLines: string[],
  translationLines: string[],
  index: number,
  metrics: PaginationMetrics,
): MushafVerseItem {
  return {
    ...block,
    id: `${block.id}__part_${index + 1}`,
    arabicLines,
    translationLines,
    continuationFromPrevious: index > 0,
    continuationToNext: false,
    heightPx: calculateVerseHeight(arabicLines, translationLines, metrics),
  };
}

export function splitOversizedBlockIfNeeded(
  block: MushafPageItem,
  safeHeightPx: number,
  metrics: PaginationMetrics,
): MushafPageItem[] {
  if (block.kind !== 'verse' || block.heightPx <= safeHeightPx) {
    return [block];
  }

  if (block.arabicLines.length === 0 && block.translationLines.length === 0) {
    return [block];
  }

  const fragments: MushafVerseItem[] = [];
  let arabicStart = 0;
  let translationStart = 0;

  while (arabicStart < block.arabicLines.length || translationStart < block.translationLines.length) {
    let arabicEnd = arabicStart;
    let translationEnd = translationStart;

    let height = metrics.versePaddingYPx * 2;
    let hasArabic = false;
    let hasTranslation = false;
    let advanced = true;

    while (advanced) {
      advanced = false;

      if (arabicEnd < block.arabicLines.length) {
        const nextHeight = height + metrics.arabicLineHeightPx;
        if (nextHeight <= safeHeightPx || (!hasArabic && !hasTranslation)) {
          arabicEnd += 1;
          height = nextHeight;
          hasArabic = true;
          advanced = true;
          continue;
        }
      }

      if (arabicEnd >= block.arabicLines.length && translationEnd < block.translationLines.length) {
        const needsSectionGap = hasArabic && !hasTranslation;
        const nextHeight =
          height +
          (needsSectionGap ? metrics.sectionGapPx : 0) +
          metrics.translationLineHeightPx;

        if (nextHeight <= safeHeightPx || (!hasArabic && !hasTranslation)) {
          translationEnd += 1;
          height = nextHeight;
          hasTranslation = true;
          advanced = true;
        }
      }
    }

    if (arabicEnd === arabicStart && translationEnd === translationStart) {
      if (arabicStart < block.arabicLines.length) {
        arabicEnd = arabicStart + 1;
      } else if (translationStart < block.translationLines.length) {
        translationEnd = translationStart + 1;
      }
    }

    const fragment = cloneVerseBlockWithLines(
      block,
      block.arabicLines.slice(arabicStart, arabicEnd),
      block.translationLines.slice(translationStart, translationEnd),
      fragments.length,
      metrics,
    );

    fragments.push(fragment);
    arabicStart = arabicEnd;
    translationStart = translationEnd;
  }

  for (let index = 0; index < fragments.length; index += 1) {
    fragments[index].continuationFromPrevious = index > 0;
    fragments[index].continuationToNext = index < fragments.length - 1;
  }

  return fragments;
}

function computePlacementHeight(page: WorkingPage, item: MushafPageItem, gapPx: number): number {
  const needsGap = page.items.length > 0;
  return item.heightPx + (needsGap ? gapPx : 0);
}

function recomputePageHeight(page: WorkingPage, gapPx: number): void {
  page.usedHeightPx = page.items.reduce((acc, item, index) => {
    const withGap = index > 0 ? gapPx : 0;
    return acc + withGap + item.heightPx;
  }, 0);
}

function rebalancePages(
  pages: Map<number, WorkingPage>,
  safeHeightPx: number,
  gapPx: number,
): void {
  const sortedPageNumbers = [...pages.keys()].sort((a, b) => a - b);

  for (let index = 0; index < sortedPageNumbers.length - 1; index += 1) {
    const currentPage = pages.get(sortedPageNumbers[index]);
    const nextPage = pages.get(sortedPageNumbers[index + 1]);

    if (!currentPage || !nextPage || nextPage.items.length === 0) {
      continue;
    }

    let moved = true;
    while (moved && nextPage.items.length > 0) {
      moved = false;
      const candidate = nextPage.items[0];
      if (candidate.anchorPage > currentPage.pageNumber) {
        break;
      }

      const requiredHeight = computePlacementHeight(currentPage, candidate, gapPx);
      if (currentPage.usedHeightPx + requiredHeight > safeHeightPx) {
        break;
      }

      nextPage.items.shift();
      currentPage.items.push(candidate);
      recomputePageHeight(currentPage, gapPx);
      recomputePageHeight(nextPage, gapPx);
      moved = true;
    }
  }

  for (const [pageNumber, page] of pages.entries()) {
    if (page.items.length === 0) {
      pages.delete(pageNumber);
    }
  }
}

export function paginateBlocksIntoPages(
  blocks: MushafPageItem[],
  safeHeightPx: number,
  metrics: PaginationMetrics,
): Map<number, WorkingPage> {
  const pages = new Map<number, WorkingPage>();
  if (blocks.length === 0) {
    return pages;
  }

  const getOrCreatePage = (pageNumber: number): WorkingPage => {
    const existing = pages.get(pageNumber);
    if (existing) {
      return existing;
    }

    const created: WorkingPage = {
      pageNumber,
      items: [],
      usedHeightPx: 0,
    };
    pages.set(pageNumber, created);
    return created;
  };

  let currentPageNumber = Math.max(1, blocks[0].anchorPage);

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const block = blocks[blockIndex];
    currentPageNumber = Math.max(currentPageNumber, block.anchorPage);

    const splitBlocks = splitOversizedBlockIfNeeded(block, safeHeightPx, metrics);

    for (let splitIndex = 0; splitIndex < splitBlocks.length; splitIndex += 1) {
      const splitBlock = splitBlocks[splitIndex];
      let placed = false;

      while (!placed) {
        const page = getOrCreatePage(currentPageNumber);
        const placementHeight = computePlacementHeight(page, splitBlock, metrics.blockGapPx);
        const remainingHeight = safeHeightPx - page.usedHeightPx;

        const isLastGlobalBlock =
          blockIndex === blocks.length - 1 && splitIndex === splitBlocks.length - 1;
        const predictedRemainder = remainingHeight - placementHeight;
        const wouldLeaveTinyGap =
          !isLastGlobalBlock &&
          predictedRemainder > 0 &&
          predictedRemainder < metrics.minRemainingPx &&
          page.items.length > 0;

        if (placementHeight <= remainingHeight && !wouldLeaveTinyGap) {
          page.items.push(splitBlock);
          page.usedHeightPx += placementHeight;
          placed = true;
        } else {
          currentPageNumber += 1;
          currentPageNumber = Math.max(currentPageNumber, splitBlock.anchorPage);
        }
      }
    }
  }

  rebalancePages(pages, safeHeightPx, metrics.blockGapPx);
  return pages;
}

function toPageLayout(
  page: WorkingPage,
  safeArea: MushafSafeArea,
  metrics: PaginationMetrics,
): MushafPageLayout {
  const items = page.items;
  const rawItemsHeight = items.reduce((acc, item) => acc + item.heightPx, 0);
  const baseGapTotal = items.length > 1 ? metrics.blockGapPx * (items.length - 1) : 0;
  const baseUsedHeight = rawItemsHeight + baseGapTotal;

  const extraHeight = Math.max(0, safeArea.height - baseUsedHeight);
  const canDistribute = items.length > 1;
  const distributedGap = canDistribute ? metrics.blockGapPx + extraHeight / (items.length - 1) : 0;

  const renderedUsedHeight = canDistribute
    ? rawItemsHeight + distributedGap * (items.length - 1)
    : baseUsedHeight;

  const underfillPx = Math.max(0, safeArea.height - renderedUsedHeight);
  const overflowPx = Math.max(0, renderedUsedHeight - safeArea.height);

  return {
    pageNumber: page.pageNumber,
    items,
    safeArea,
    typography: createTypographySnapshot(metrics),
    usedHeightPx: roundToSingleDecimal(renderedUsedHeight),
    renderGapPx: roundToSingleDecimal(distributedGap),
    underfillPx: roundToSingleDecimal(underfillPx),
    overflowPx: roundToSingleDecimal(overflowPx),
    fillRatio: safeArea.height > 0
      ? clamp(roundToSingleDecimal(renderedUsedHeight / safeArea.height), 0, 1)
      : 0,
  };
}

export function buildPageMap({
  verses,
  surahs,
  pageWidth,
  pageHeight,
  viewType,
  fontSize,
  lineHeight,
  safeInsets,
}: BuildPageMapInput): MushafPaginationResult {
  const resolvedInsets = createSafeInsets(safeInsets);
  const safeArea = createSafeArea(pageWidth, pageHeight, resolvedInsets);

  const maxVersePage = verses.reduce((maxPage, verse) => Math.max(maxPage, Math.max(1, verse.page)), 1);

  if (verses.length === 0) {
    return {
      pagesByNumber: new Map<number, MushafPageLayout>(),
      maxPageNumber: maxVersePage,
      safeArea,
      safeInsets: resolvedInsets,
    };
  }

  const metrics = createPaginationMetrics(viewType, fontSize, lineHeight);
  const textMeasure = createTextMeasureContext();

  const blocks = prepareVerseBlocks(verses, surahs, safeArea, metrics, textMeasure);
  const workingPages = paginateBlocksIntoPages(blocks, safeArea.height, metrics);

  const pagesByNumber = new Map<number, MushafPageLayout>();
  let maxPageNumber = maxVersePage;

  for (const [pageNumber, page] of workingPages.entries()) {
    pagesByNumber.set(pageNumber, toPageLayout(page, safeArea, metrics));
    maxPageNumber = Math.max(maxPageNumber, pageNumber);
  }

  return {
    pagesByNumber,
    maxPageNumber,
    safeArea,
    safeInsets: resolvedInsets,
  };
}
