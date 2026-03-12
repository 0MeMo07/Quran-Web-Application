import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { selectSurahs } from '../store/slices/quranSlice';
import { useTranslations } from '../translations';
import { fetchVerseParts } from '../api/quranApi';
import type { Verse, VersePart } from '../api/types';

// ─── Tooltip (portal) ───────────────────────────────────────────────────────

interface WordTooltipProps {
  part: VersePart;
  language: string;
  anchorRef: React.RefObject<HTMLDivElement>;
}

function WordTooltip({ part, language, anchorRef }: WordTooltipProps) {
  const t = useTranslations();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);
  const transcription = language === 'en'
    ? (part.transcription_en || part.transcription_tr)
    : (part.transcription_tr || part.transcription_en);

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY - 8,   // 8px gap above anchor
        left: r.left + r.width / 2,
      });
    }
  }, [anchorRef]);

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        width: '15rem',
      }}
    >
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 text-sm">
        {/* Arabic word */}
        <p className="text-2xl font-arabic text-right mb-1 text-emerald-600 dark:text-emerald-400 leading-relaxed" dir="rtl" lang="ar">
          {part.arabic}
        </p>
        {/* Transcription */}
        {transcription && (
          <p className="text-gray-400 dark:text-gray-500 italic text-xs mb-2">{transcription}</p>
        )}
        {/* Meaning */}
        <p className="text-gray-800 dark:text-gray-100 font-medium mb-2 leading-snug">{meaning}</p>
        {/* Root */}
        {part.root ? (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex items-center justify-between gap-2">
            <span className="text-gray-400 dark:text-gray-500 text-xs">{t.detail.root}:</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-arabic text-lg leading-normal" dir="rtl">{part.root.arabic}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">({part.root.latin})</span>
            </span>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-xs border-t border-gray-100 dark:border-gray-700 pt-2">{t.detail.noRoot}</p>
        )}
      </div>
      {/* Arrow */}
      <div className="w-3 h-3 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45 mx-auto -mt-1.5" />
    </div>,
    document.body,
  );
}

// ─── Word chip ───────────────────────────────────────────────────────────────

interface WordChipProps {
  part: VersePart;
  language: string;
}

function WordChip({ part, language }: WordChipProps) {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);

  return (
    <div
      ref={anchorRef}
      className="relative flex flex-col items-center cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && <WordTooltip part={part} language={language} anchorRef={anchorRef} />}

      <div
        className={`px-3 py-2 rounded-xl border transition-all duration-150 text-center min-w-[72px] max-w-[120px] ${
          hovered
            ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-600 shadow-md'
            : 'bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600'
        }`}
      >
        {/* Arabic */}
        <p
          className="text-xl font-arabic text-gray-900 dark:text-white leading-relaxed"
          dir="rtl"
          lang="ar"
        >
          {part.arabic}
        </p>
        {/* Meaning */}
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 w-full truncate leading-tight">
          {meaning}
        </p>
        {/* Root badge */}
        {part.root ? (
          <Link
            to={`/root/${encodeURIComponent(part.root.latin)}`}
            className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title={`${t.detail.viewRoot}: ${part.root.latin}`}
          >
            <span className="font-arabic text-sm leading-tight" dir="rtl">{part.root.arabic}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5 shrink-0" />
          </Link>
        ) : (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs">
            —
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Single verse card ───────────────────────────────────────────────────────

interface DetailVerseCardProps {
  verse: Verse;
}

function DetailVerseCard({ verse }: DetailVerseCardProps) {
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);
  const selectedSurah = surahs.find((s) => s.id === verse.surah_id);

  const [expanded, setExpanded] = useState(false);
  const [parts, setParts] = useState<VersePart[] | null>(null);
  const [loadingParts, setLoadingParts] = useState(false);
  const [partsError, setPartsError] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const analysisRequestIdRef = useRef(0);
  const lastVerseIdRef = useRef(verse.id);

  const loadVerseParts = useCallback(async (surahId: number, verseNumber: number) => {
    const requestId = ++analysisRequestIdRef.current;
    setLoadingParts(true);
    setPartsError(false);

    try {
      const nextParts = await fetchVerseParts(surahId, verseNumber);
      if (requestId === analysisRequestIdRef.current) {
        setParts(nextParts);
      }
    } catch {
      if (requestId === analysisRequestIdRef.current) {
        setParts(null);
        setPartsError(true);
      }
    } finally {
      if (requestId === analysisRequestIdRef.current) {
        setLoadingParts(false);
      }
    }
  }, []);

  useEffect(() => {
    if (lastVerseIdRef.current === verse.id) {
      return;
    }

    lastVerseIdRef.current = verse.id;

    // Invalidate old in-flight requests and clear stale analysis when verse changes.
    analysisRequestIdRef.current += 1;
    setParts(null);
    setPartsError(false);
    setLoadingParts(false);
    setShowFootnotes(false);

    if (expanded) {
      loadVerseParts(verse.surah_id, verse.verse_number);
    }
  }, [verse.id, verse.surah_id, verse.verse_number, expanded, loadVerseParts]);

  const handleToggle = () => {
    if (!expanded) {
      if (parts === null && !loadingParts) {
        loadVerseParts(verse.surah_id, verse.verse_number);
      }
      setExpanded(true);
      return;
    }

    setExpanded(false);
  };

  return (
    <div
      data-verse-id={verse.id}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header row */}
      {verse.verse_number === 1 && selectedSurah && (
        <div className="px-6 pt-5 pb-2 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {language === 'en' ? selectedSurah.name_en : selectedSurah.name}
            </span>
            <span className="text-xs text-gray-400">— {selectedSurah.verse_count} {t.verse.verse}</span>
          </div>
        </div>
      )}

      <div className="px-5 py-5">
        {/* Verse number badge */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">{verse.verse_number}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.verse.juz} {verse.juz_number} · {t.verse.page} {verse.page}
            </span>
          </div>
          {/* Expand button */}
          <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              expanded
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {t.detail.hideAnalysis}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {t.detail.showAnalysis}
              </>
            )}
          </button>
        </div>

        {/* Arabic verse */}
        <p
          className="text-4xl font-arabic leading-loose text-right text-gray-900 dark:text-white mb-3"
          dir="rtl"
          lang="ar"
        >
          {verse.verse}
        </p>

        {/* Transcription */}
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
          {language === 'en' ? verse.transcription_en : verse.transcription}
        </p>

        {/* Translation */}
        {verse.translation && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {verse.translation.text}
            </p>
            {/* Footnotes */}
            {verse.translation.footnotes && verse.translation.footnotes.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowFootnotes((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  {showFootnotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showFootnotes ? t.verse.hideFootnotes : t.verse.showFootnotes}
                </button>
                {showFootnotes && (
                  <div className="mt-2 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    {verse.translation.footnotes.map((fn) => (
                      <p key={fn.id} className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">[{fn.number}]</span>{' '}
                        {fn.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Word-by-word analysis ── */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              {t.detail.wordAnalysis}
            </p>

            {loadingParts ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : partsError ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t.detail.noPartsAvailable}
              </p>
            ) : parts && parts.length > 0 ? (
              /* RTL word grid */
              <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                {[...parts].sort((a, b) => a.sort_number - b.sort_number).map((part) => (
                  <WordChip key={part.id} part={part} language={language} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t.detail.noPartsAvailable}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

interface DetailLayoutProps {
  verses: Verse[];
}

export function DetailLayout({ verses }: DetailLayoutProps) {
  const [idx, setIdx] = useState(0);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);

  // Reset to first verse when the verse list changes (surah switch)
  useEffect(() => {
    setIdx(0);
  }, [verses]);

  if (verses.length === 0) return null;

  const verse = verses[idx];
  const surah = surahs.find((s) => s.id === verse.surah_id);
  const surahName = language === 'en' ? (surah?.name_en ?? surah?.name ?? '') : (surah?.name ?? '');
  const total = verses.length;

  const goTo = (verseNum: number) => {
    const target = verses.findIndex((v) => v.verse_number === verseNum);
    if (target !== -1) {
      setIdx(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prev = () => { if (idx > 0) { setIdx(idx - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const next = () => { if (idx < total - 1) { setIdx(idx + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputVal, 10);
    if (!isNaN(num) && num >= 1 && num <= total) {
      goTo(num);
    }
    setInputOpen(false);
    setInputVal('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* ── Sticky nav bar ── */}
      <div className="sticky top-16 z-10 -mx-4 px-4 py-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Link
            to={`/surah/${verse.surah_id}`}
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>{surahName}</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">—</span>
          <span className="text-gray-500 dark:text-gray-400">{t.verse.verse} {verse.verse_number}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {inputOpen ? (
            <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                min={1}
                max={total}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={() => { setInputOpen(false); setInputVal(''); }}
                className="w-16 text-center text-xs px-2 py-1 rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30 tabular-nums"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">/ {total}</span>
            </form>
          ) : (
            <button
              onClick={() => { setInputOpen(true); setInputVal(String(verse.verse_number)); }}
              className="text-xs text-gray-500 dark:text-gray-400 w-16 text-center tabular-nums px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title={t.verse.verse}
            >
              {verse.verse_number} / {total}
            </button>
          )}

          <button
            onClick={next}
            disabled={idx === total - 1}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Single verse card ── */}
      <DetailVerseCard verse={verse} />

      {/* ── Bottom prev / next ── */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.versePage?.prevVerse}
        </button>

        <Link
          to={`/surah/${verse.surah_id}/verse/${verse.verse_number}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t.versePage?.backToSurah}
        </Link>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {t.versePage?.nextVerse}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
