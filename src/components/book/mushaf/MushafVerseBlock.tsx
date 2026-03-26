import React from 'react';
import type { Verse } from '../../../api/types';
import { BANNER_LINES, BISMILLAH_LINES } from './mushafLayout';

interface MushafVerseBlockProps {
  surahId: string;
  surahName: string;
  verses: Verse[];
  fontSize: number;
  lineHeightPx: number;
  useCssVars?: boolean;
  isUnwan?: boolean;
}

export function MushafVerseBlock({ 
  surahId, 
  surahName, 
  verses, 
  fontSize, 
  lineHeightPx, 
  useCssVars = false,
  isUnwan = false
}: MushafVerseBlockProps) {
  const isSurahStart = verses[0]?.verse_number === 1;
  const hasBismillah = isSurahStart && Number(surahId) !== 1 && Number(surahId) !== 9;

  return (
    <div className="flex flex-col w-full">
      {isSurahStart && (
        <div className="flex flex-col items-center">
            <div
              className={`w-full border-y flex items-center justify-center relative overflow-hidden rounded-sm ${isUnwan ? 'border-primary/40 bg-primary/[0.03] py-2' : 'border-primary/20 bg-amber-50/5'}`}
              style={{ height: isUnwan ? 'auto' : BANNER_LINES * lineHeightPx, minHeight: BANNER_LINES * lineHeightPx }}
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              {!isUnwan && (
                <>
                  <div className="absolute left-4 w-12 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  <div className="absolute right-4 w-12 h-px bg-gradient-to-l from-primary/30 to-transparent" />
                </>
              )}
              <span
                className={`font-arabic text-primary/70 font-bold ${isUnwan ? 'text-2xl z-10' : ''}`}
                style={useCssVars
                  ? { fontSize: isUnwan ? 'calc(var(--mushaf-font-size) * 1.0)' : 'max(18px, calc(var(--mushaf-font-size) * 1.1))' }
                  : { fontSize: isUnwan ? Math.round(fontSize * 1.0) : Math.max(18, Math.round(fontSize * 1.1)) }}
              >
                سورة {surahName}
              </span>
            </div>

          {hasBismillah && (
            <div
              className={`font-arabic text-primary/60 text-center flex items-center justify-center ${isUnwan ? 'py-4 text-xl' : 'border-b border-primary/5'}`}
              style={{
                height: isUnwan ? 'auto' : BISMILLAH_LINES * lineHeightPx,
                fontSize: useCssVars
                  ? (isUnwan ? 'calc(var(--mushaf-font-size) * 1.0)' : 'max(18px, calc(var(--mushaf-font-size) * 1.05))')
                  : (isUnwan ? Math.round(fontSize * 1.0) : Math.max(18, Math.round(fontSize * 1.05))),
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </div>
          )}
        </div>
      )}

      <div
        className="font-arabic text-foreground/90 w-full selection:bg-primary/20"
        style={{
          fontSize: isUnwan ? `${fontSize}px` : (useCssVars ? 'var(--mushaf-font-size)' : `${fontSize}px`),
          lineHeight: useCssVars ? 'var(--mushaf-line-height)' : `${lineHeightPx}px`,
          textAlign: isUnwan ? 'center' : 'justify',
          textJustify: 'inter-character',
          textAlignLast: 'right', 
          wordSpacing: '0em',
          letterSpacing: '0.001em',
          fontWeight: 400,
          whiteSpace: 'normal',
          wordBreak: 'keep-all',
        }}
      >
        {verses.map((v) => (
          <React.Fragment key={v.id}>
            <span className="inline leading-normal">{v.verse}</span>
            <span
              className="inline-flex items-center justify-center rounded-full font-sans text-primary/50 border border-primary/20 bg-primary/[0.03] mx-[0.12em] align-middle select-none"
              style={{
                fontSize: '0.36em',
                width: '1.9em',
                height: '1.9em',
                lineHeight: 1,
                verticalAlign: 'middle',
                transform: 'translateY(-0.1em)'
              }}
            >
              {v.verse_number}
            </span>
            {/* If it's the end of a Surah on this page, maybe don't force justify the last line? 
                Actually Madinah Mushaf usually ends the page on a full verse that fills the line. */}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
