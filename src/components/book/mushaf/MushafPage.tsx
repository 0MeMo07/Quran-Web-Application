import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BASE_FONT_MAX,
  BASE_FONT_MIN,
  calcMushafTypography,
  MUSHAF_LINES,
  type MushafEntries,
} from './mushafLayout';
import { MushafVerseBlock } from './MushafVerseBlock';

interface MushafPageProps {
  entries: MushafEntries;
  pageHeight: number;
  pageWidth: number;
  pageNumber: number;
}

export const MushafPage = memo(function MushafPage({ entries, pageHeight, pageWidth, pageNumber }: MushafPageProps) {
  const isUnwanPage = pageNumber === 1 || pageNumber === 2;

  const { fontSize: baseFontSize, lineHeightPx, contentHeight, contentWidth } = useMemo(
    () => calcMushafTypography(entries, pageHeight, pageWidth),
    [entries, pageHeight, pageWidth]
  );

  const [fontSize, setFontSize] = useState(baseFontSize);
  const [adjustedLineHeight, setAdjustedLineHeight] = useState(lineHeightPx);
  const [ready, setReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);

  const entriesSignature = useMemo(
    () => entries
      .map(([sId, data]) => `${sId}:${data.verses.map((v) => `${v.id}-${v.verse_number}`).join(',')}`)
      .join('|'),
    [entries]
  );

  useEffect(() => {
    let cancelled = false;

    if (typeof document === 'undefined' || !(document as Document & { fonts?: FontFaceSet }).fonts) {
      setFontsReady(true);
      return;
    }

    const fontSet = (document as Document & { fonts: FontFaceSet }).fonts;
    Promise.all([
      fontSet.load("400 24px 'Scheherazade New'"),
      fontSet.load("400 24px 'Noto Naskh Arabic'"),
      fontSet.ready,
    ])
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!fontsReady) {
      setReady(false);
      return;
    }

    const el = measureRef.current;
    if (!el) {
      setFontSize(baseFontSize);
      setReady(true);
      return;
    }

    let lo = Math.max(BASE_FONT_MIN, baseFontSize - 5);
    let hi = Math.min(BASE_FONT_MAX, baseFontSize + 5); // Brighter range for better fill
    let best = Math.max(BASE_FONT_MIN, Math.min(BASE_FONT_MAX, baseFontSize));

    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      el.style.setProperty('--mushaf-font-size', `${mid}px`);
      el.style.setProperty('--mushaf-line-height', `${lineHeightPx}px`);

      const measured = el.scrollHeight;
      const lines = Math.round(measured / lineHeightPx);
      
      // STRICT: Must not exceed 16 lines and must not exceed contentHeight
      if (lines <= MUSHAF_LINES && measured <= contentHeight + 1) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const finalSize = Math.max(BASE_FONT_MIN, Math.min(BASE_FONT_MAX, Math.floor(best)));
    setFontSize(finalSize);

    // Advanced Vertical Balancing:
    // After finding the best font size, measure the actual lines and adjust line-height to fill the page.
    el.style.setProperty('--mushaf-font-size', `${finalSize}px`);
    el.style.setProperty('--mushaf-line-height', `${lineHeightPx}px`);
    
    const finalMeasured = el.scrollHeight;
    const actualLines = Math.round(finalMeasured / lineHeightPx);
    
    if (actualLines > 0 && actualLines < MUSHAF_LINES) {
      // If we have fewer than 15 lines, stretch them but with a cap to avoid overly sparse layouts
      // For Unwan pages, we can stretch more to create that special "opening" look
      const stretchLimit = isUnwanPage ? 1.3 : 1.15;  // ← çok daha konservatif
      const maxStretch = lineHeightPx * stretchLimit;
      const targetLineHeight = Math.min(maxStretch, contentHeight / actualLines);
      setAdjustedLineHeight(targetLineHeight);
    } else if (actualLines >= MUSHAF_LINES) {
      // If we have 15 lines but it's still slightly shorter than contentHeight, stretch it to fill
      setAdjustedLineHeight(Math.max(lineHeightPx, contentHeight / actualLines));
    } else {
      setAdjustedLineHeight(lineHeightPx);
    }

    setReady(true);
  }, [fontsReady, baseFontSize, lineHeightPx, contentHeight, entriesSignature]);

  return (
    <>
      <div
        ref={measureRef}
        className="fixed -top-[10000px] -left-[10000px] pointer-events-none z-[-1]"
        style={{
          width: contentWidth,
          maxHeight: contentHeight,
          overflow: 'visible',
          visibility: 'hidden',
          direction: 'rtl',
          ['--mushaf-font-size' as string]: `${baseFontSize}px`,
          ['--mushaf-line-height' as string]: `${lineHeightPx}px`,
        }}
      >
        {entries.map(([sId, data]) => (
          <MushafVerseBlock
            key={`measure-${sId}`}
            surahId={sId}
            surahName={data.name}
            verses={data.verses}
            fontSize={baseFontSize}
            lineHeightPx={lineHeightPx}
            useCssVars
          />
        ))}
      </div>

      <div 
        className={`flex flex-col h-full transition-opacity duration-300 ease-in-out ${isUnwanPage ? 'justify-center items-center text-center px-4' : ''}`} 
        style={{ direction: 'rtl', opacity: ready ? 1 : 0 }}
      >
        {isUnwanPage && (
          <div className="absolute inset-x-8 inset-y-12 pointer-events-none opacity-10 border-[8px] border-double border-primary/40 rounded-3xl" />
        )}
        {entries.map(([sId, data]) => (
          <MushafVerseBlock
            key={sId}
            surahId={String(sId)}
            surahName={data.name}
            verses={data.verses}
            isUnwan={isUnwanPage}
            fontSize={fontSize}
            lineHeightPx={adjustedLineHeight}
          />
        ))}
      </div>
    </>
  );
});
