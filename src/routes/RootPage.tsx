import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react';
import { fetchRootByLatin, fetchRootVerses } from '../api/quranApi';
import type { RootDetail, RootDiff, RootVerseItem, RootVersesPagination } from '../api/types';
import { useTranslations } from '../translations';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { RootSearchInput } from '../components/root/RootSearchInput';
import { RootVerseCard } from '../components/root/RootVerseCard';






/* ──────────────────────────────────────────── RootPage ── */
export function RootPage() {
  const { latin } = useParams<{ latin: string }>();
  const navigate = useNavigate();
  const t = useTranslations();
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const language = useSelector(selectSearchLanguage) as 'en' | 'tr';

  const [root, setRoot] = useState<RootDetail | null>(null);
  const [versesData, setVersesData] = useState<RootVersesPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingRoot, setLoadingRoot] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDiff, setActiveDiff] = useState<RootDiff | null>(null);

  /* Load root detail */
  useEffect(() => {
    if (!latin) return;
    setLoadingRoot(true);
    setError(null);
    setRoot(null);
    setActiveDiff(null);
    setCurrentPage(1);
    fetchRootByLatin(latin)
      .then(setRoot)
      .catch(() => setError(t.root.notFound))
      .finally(() => setLoadingRoot(false));
  }, [latin]);

  /* Load verses */
  const loadVerses = useCallback(
    (page: number) => {
      if (!latin) return;
      setLoadingVerses(true);
      fetchRootVerses(latin, page, selectedAuthor?.id)
        .then(setVersesData)
        .catch(() => setVersesData(null))
        .finally(() => setLoadingVerses(false));
    },
    [latin, selectedAuthor],
  );

  useEffect(() => {
    loadVerses(currentPage);
  }, [loadVerses, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Computed */
  const totalOccurrences = root?.diffs.reduce((s, d) => s + d.count, 0) ?? 0;
  const displayedVerses: RootVerseItem[] = activeDiff
    ? (versesData?.data.filter((v) => v.rootdiff_id === activeDiff.id) ?? [])
    : (versesData?.data ?? []);
  const formSampleByDiffId = useMemo(() => {
    const samples = new Map<number, RootVerseItem>();
    if (!versesData) return samples;
    for (const item of versesData.data) {
      if (!samples.has(item.rootdiff_id)) {
        samples.set(item.rootdiff_id, item);
      }
    }
    return samples;
  }, [versesData]);

  const getFormGloss = useCallback((diffId: number) => {
    const sample = formSampleByDiffId.get(diffId);
    if (!sample) return null;

    if (language === 'tr') {
      return sample.turkish || sample.transcription || null;
    }

    // API, form-level English gloss doesn't exist; use transliteration as concise fallback.
    return sample.transcription || null;
  }, [formSampleByDiffId, language]);

  /* ── Full-page loading */
  if (loadingRoot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  /* ── Error / not found */
  if (error || !root) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              {error || t.root.notFound}
            </p>
            <p className="text-sm text-muted-foreground font-mono">"{latin}"</p>
          </div>
          <div className="flex justify-center">
            <RootSearchInput currentLatin={latin ?? ''} />
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-secondary hover:opacity-80 text-foreground rounded-lg transition-colors"
          >
            {t.root.backToHome}
          </button>
        </div>
      </div>
    );
  }

  /* ── Meaning — language-aware */
  const primaryMeaning = language === 'tr' ? root.mean : root.mean_en;
  const primaryTranscription = language === 'tr' ? root.transcription : root.transcription_en;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky nav */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-surface/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-0 sm:h-14 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
              aria-label={t.root.backToHome}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="hidden sm:block text-sm font-semibold text-foreground">
              {t.root.title}
            </span>
          </div>
          <RootSearchInput currentLatin={latin ?? ''} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* ╔══════════════════════════════ Hero card ══════════════╗ */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-primary text-primary-foreground p-5 sm:p-8">
          {/* Decorative large background Arabic text */}
          <div
            className="absolute -top-4 -right-6 text-[10rem] sm:text-[22rem] leading-none font-arabic text-white/10 select-none pointer-events-none"
            aria-hidden="true"
            dir="rtl"
          >
            {root.arabic}
          </div>

          <div className="relative z-10">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-medium">
                {t.root.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-mono tracking-wider">
                {root.latin}
              </span>
            </div>

            {/* Arabic root — large */}
            <p
              className="text-5xl sm:text-8xl font-arabic font-bold leading-tight mb-2 drop-shadow-lg"
              dir="rtl"
              lang="ar"
            >
              {root.arabic}
            </p>

            {/* Transcription */}
            {primaryTranscription && (
              <p className="text-white/75 text-base sm:text-lg italic mb-5 sm:mb-6">
                {primaryTranscription}
              </p>
            )}

            {/* Meaning box */}
            {primaryMeaning && (
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 mb-5 sm:mb-6">
                {primaryMeaning && (
                  <p className="text-white font-medium leading-relaxed">{primaryMeaning}</p>
                )}
              </div>
            )}

            {/* Stats ribbon */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <span className="text-xl sm:text-2xl font-bold tabular-nums">{totalOccurrences}</span>
                <span className="text-white/80 text-sm leading-tight">{t.root.totalOccurrences}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <span className="text-xl sm:text-2xl font-bold tabular-nums text-primary-foreground">{root.diffs.length}</span>
                <span className="text-primary-foreground/80 text-sm leading-tight">{t.root.forms}</span>
              </div>
              {versesData && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums text-primary-foreground">
                    {new Set(versesData.data.map((v) => v.surah.id)).size}+
                  </span>
                  <span className="text-primary-foreground/80 text-sm leading-tight">{t.root.uniqueSurahs}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ╔══════════════════════════ Word Forms / Diffs ══════════╗ */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-primary inline-block" />
              {t.root.forms}
            </h2>
            {activeDiff && (
              <button
                onClick={() => setActiveDiff(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
                {t.root.clearFilter}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* "All" chip */}
            <button
              onClick={() => setActiveDiff(null)}
              className={`inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                !activeDiff
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary text-foreground border-border hover:border-primary'
              }`}
            >
              {t.root.allForms}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  !activeDiff
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {totalOccurrences}
              </span>
            </button>

            {/* Per-diff chips */}
            {root.diffs.map((diff) => {
              const formGloss = getFormGloss(diff.id);
              return (
              <button
                key={diff.id}
                onClick={() => setActiveDiff(activeDiff?.id === diff.id ? null : diff)}
                className={`inline-flex flex-col items-start gap-1 px-3 py-2 rounded-xl text-sm border transition-all text-left ${
                  activeDiff?.id === diff.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-secondary text-foreground border-border hover:border-primary'
                }`}
              >
                <span className="w-full inline-flex items-center justify-between gap-2">
                  <span
                    className="text-2xl font-arabic font-semibold leading-none"
                    dir="rtl"
                    lang="ar"
                  >
                    {diff.diff}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeDiff?.id === diff.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {diff.count}
                  </span>
                </span>
                {formGloss && (
                  <span className={`text-xs leading-snug line-clamp-2 ${activeDiff?.id === diff.id ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formGloss}
                  </span>
                )}
              </button>
              );
            })}
          </div>
        </div>

        {/* ╔════════════════════════════════ Verses ═══════════════╗ */}
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-primary inline-block" />
              {t.root.verses}
              {versesData && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({activeDiff
                    ? `${displayedVerses.length} / ${versesData.meta.total}`
                    : versesData.meta.total})
                </span>
              )}
            </h2>
            {versesData && versesData.meta.last_page > 1 && (
              <span className="text-sm text-muted-foreground">
                {t.root.page} {versesData.meta.current_page} {t.root.of} {versesData.meta.last_page}
              </span>
            )}
          </div>

          {/* Active form filter banner */}
          {activeDiff && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-sm flex-wrap">
              <span className="text-primary font-medium">
                {t.root.showingForm}:
              </span>
              <span
                className="text-2xl font-arabic font-bold text-foreground leading-none"
                dir="rtl"
                lang="ar"
              >
                {activeDiff.diff}
              </span>
              <span className="text-muted-foreground text-xs">
                ({activeDiff.count} {t.root.occurrences})
              </span>
              <button
                onClick={() => setActiveDiff(null)}
                className="ml-auto p-1 rounded-lg hover:bg-primary/20 text-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Loading */}
          {loadingVerses ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : displayedVerses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">{t.root.noVersesFound}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedVerses.map((item) => (
                <RootVerseCard key={item.id} item={item} t={t} language={language} />
              ))}
            </div>
          )}

          {/* Pagination — hidden when a diff filter is active (client-side filtered) */}
          {versesData && versesData.meta.last_page > 1 && !activeDiff && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-surface text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.root.previous}
              </button>

              <div className="flex gap-1">
                {Array.from({ length: versesData.meta.last_page }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === versesData.meta.last_page ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span
                        key={`ell-${i}`}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                          p === currentPage
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-surface border border-border text-foreground hover:bg-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= versesData.meta.last_page}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-surface text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {t.root.next}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

