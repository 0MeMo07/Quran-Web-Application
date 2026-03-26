import type { Verse } from '../../../api/types';

export type MushafEntries = [string, { name: string; verses: Verse[] }][];

export const MUSHAF_LINES = 15; // Standard Madinah Mushaf lines
export const BANNER_LINES = 2; 
export const BISMILLAH_LINES = 1; 

export const BASE_FONT_MIN = 18; // Increased minimum for better readability
export const BASE_FONT_MAX = 38; // Increased slightly
const CHAR_WIDTH_EM = 0.45;
const VERSE_BADGE_CHAR_EQUIV = 1.4;

function visualArabicLength(text: string): number {
  // Harakat and Quranic marks are combining marks with near-zero visual width.
  const withoutMarks = text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .trim();

  if (!withoutMarks) return 0;

  const spaces = (withoutMarks.match(/\s/g) || []).length;
  const letters = withoutMarks.replace(/\s+/g, '').length;

  // More accurate heuristic for Mushaf fonts
  return letters + spaces * 0.35;
}

export function calcMushafTypography(entries: MushafEntries, pageHeight: number, pageWidth: number) {
  // Safe margins for flipbook and decorative frames
  // INCREASED bottom margin (130 instead of 110) to ensure footer safety
  const contentHeight = Math.max(120, pageHeight - 130); 
  const contentWidth = Math.max(220, pageWidth - 100);

  let occupiedLines = 0;
  let totalChars = 0;
  let totalVerses = 0;

  entries.forEach(([sId, data]) => {
    const isSurahStart = data.verses[0]?.verse_number === 1;
    if (isSurahStart) {
      occupiedLines += BANNER_LINES;
      if (Number(sId) !== 1 && Number(sId) !== 9) {
        occupiedLines += BISMILLAH_LINES;
      }
    }

    data.verses.forEach((v) => {
      totalChars += visualArabicLength(v.verse);
      totalVerses += 1;
    });
  });

  const lineHeightPx = contentHeight / MUSHAF_LINES;
  const textLinesAvailable = Math.max(1, MUSHAF_LINES - occupiedLines);

  const effectiveChars = Math.max(1, totalChars + totalVerses * VERSE_BADGE_CHAR_EQUIV);
  
  // Balanced factor for 16 lines to avoid overflow
  const fontFromHeight = lineHeightPx * 0.61; 
  const fontFromWidth = (contentWidth * textLinesAvailable) / (effectiveChars * CHAR_WIDTH_EM);

  let fontSize = Math.floor(Math.min(fontFromHeight, fontFromWidth));
  
  // Dampen variations to keep a premium, consistent feel
  const IDEAL_MUSHAF_FONT = 28; // 32'den düşür
  if (fontSize > IDEAL_MUSHAF_FONT) {
    fontSize = IDEAL_MUSHAF_FONT + (fontSize - IDEAL_MUSHAF_FONT) * 0.25; // 0.35'ten daha agresif dampen
  }
  
  fontSize = Math.max(BASE_FONT_MIN, Math.min(BASE_FONT_MAX, Math.floor(fontSize)));
  
  return {
    fontSize,
    lineHeightPx,
    contentHeight,
    contentWidth,
    occupiedLines,
    textLinesAvailable
  };
}
