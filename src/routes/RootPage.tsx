import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, BookOpen, Search,
  Copy, Check, X, ExternalLink,
} from 'lucide-react';
import { fetchRootByLatin, fetchRootVerses } from '../api/quranApi';
import type { RootDetail, RootDiff, RootVerseItem, RootVersesPagination } from '../api/types';
import { useTranslations } from '../translations';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';

/* ─────────────────────────────────────────────── Constants ── */
const PROP_COLORS = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'bg-teal-500/10 text-teal-500 border-teal-500/20',
  'bg-orange-500/10 text-orange-500 border-orange-500/20',
];

/* ─────────────────────────────────────────── useCopy hook ── */
function useCopy(ms = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), ms);
    },
    [ms],
  );
  return { copied, copy };
}

/* ────────────────────────────────────── RootSearchInput ── */
function RootSearchInput({ currentLatin }: { currentLatin: string }) {
  const [val, setVal] = useState('');
  const navigate = useNavigate();
  const t = useTranslations();

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const v = val.trim();
    if (v && v.toLowerCase() !== currentLatin.toLowerCase()) {
      navigate(`/root/${encodeURIComponent(v)}`);
      setVal('');
    }
  };

  return (
    <form onSubmit={go} className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={t.root.searchRootPlaceholder}
          className="pl-8 pr-3 py-1.5 text-sm w-full sm:w-44 bg-secondary rounded-lg border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder-muted-foreground transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={!val.trim()}
        className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-40 transition-colors shrink-0"
      >
        {t.root.searchRootBtn}
      </button>
    </form>
  );
}

/* ──────────────────────────────────────────── VerseCard ── */
interface VerseCardProps {
  item: RootVerseItem;
  t: ReturnType<typeof useTranslations>;
  language: 'en' | 'tr';
}

const GRAMMAR_TERM_MAP: Record<string, { tr: string; en: string }> = {
  isim: { tr: 'İsim', en: 'Noun' },
  fiil: { tr: 'Fiil', en: 'Verb' },
  harf: { tr: 'Harf', en: 'Particle' },
  sifat: { tr: 'Sıfat', en: 'Adjective' },
  zamir: { tr: 'Zamir', en: 'Pronoun' },
  edat: { tr: 'Edat', en: 'Preposition' },
  mecrur: { tr: 'Mecrur', en: 'Genitive' },
  merfu: { tr: 'Merfu', en: 'Nominative' },
  mansub: { tr: 'Mansub', en: 'Accusative' },
  marife: { tr: 'Marife', en: 'Definite' },
  nekre: { tr: 'Nekre', en: 'Indefinite' },
  eril: { tr: 'Eril', en: 'Masculine' },
  disil: { tr: 'Dişil', en: 'Feminine' },
  tekil: { tr: 'Tekil', en: 'Singular' },
  cemi: { tr: 'Çoğul', en: 'Plural' },
  muzari: { tr: 'Muzari', en: 'Present' },
  mazi: { tr: 'Mazi', en: 'Past' },
  emir: { tr: 'Emir', en: 'Imperative' },
};

const GRAMMAR_EN_TOKEN_MAP: Record<string, string> = {
  isim: 'noun',
  fiil: 'verb',
  harf: 'particle',
  sifat: 'adjective',
  zamir: 'pronoun',
  edat: 'preposition',
  mecrur: 'genitive',
  merfu: 'nominative',
  mansub: 'accusative',
  marife: 'definite',
  nekre: 'indefinite',
  belirsiz: 'indefinite',
  eril: 'masculine',
  disil: 'feminine',
  tekil: 'singular',
  cemi: 'plural',
  cogul: 'plural',
  muzari: 'present',
  mazi: 'past',
  emir: 'imperative',
  zaman: 'time',
  zarf: 'adverb',
  zarfi: 'adverb',
  hal: 'state',
  fail: 'subject',
  meful: 'object',
};

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeGrammarKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .replace(/[âàá]/g, 'a')
    .replace(/[îìí]/g, 'i')
    .replace(/[ûùú]/g, 'u')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[’']/g, '');
}

function toReadableLabel(value: string, language: 'en' | 'tr') {
  const key = normalizeGrammarKey(value);
  const mapped = GRAMMAR_TERM_MAP[key];

  if (mapped) {
    return language === 'en' ? mapped.en : mapped.tr;
  }

  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '';
  }

  if (language === 'en') {
    const translated = key
      .split(/(\s+|\/|,|\+|-)/)
      .map((part) => {
        const token = part.trim();
        if (!token) {
          return part;
        }
        return GRAMMAR_EN_TOKEN_MAP[token] ?? token;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    return toTitleCase(translated);
  }

  if (language === 'tr') {
    return cleaned.charAt(0).toLocaleUpperCase('tr-TR') + cleaned.slice(1);
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const VerseCard = memo(function VerseCard({ item, t, language }: VerseCardProps) {
  const { copy, copied } = useCopy();
  const props = Array.from(new Set([
    item.prop_1, item.prop_2, item.prop_3, item.prop_4,
    item.prop_5, item.prop_6, item.prop_7, item.prop_8,
  ]
    .filter(Boolean)
    .map((prop) => toReadableLabel(prop, language))
    .filter(Boolean)));

  const handleCopy = () => {
    const text = [
      `${item.surah.name} — ${t.root.verse} ${item.verse.verse_number}`,
      item.verse.verse,
      item.verse.translation?.text ?? '',
    ]
      .filter(Boolean)
      .join('\n');
    copy(text);
  };

  return (
    <article className="group bg-surface rounded-2xl shadow-sm hover:shadow-md border border-border transition-all duration-200 overflow-hidden">
      {/* ── Reference bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-border">
        <Link
          to={`/surah/${item.surah.id}/verse/${item.verse.verse_number}`}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="font-arabic text-base leading-none" lang="ar" dir="rtl">
            {item.surah.name}
          </span>
          <span className="text-primary/30">·</span>
          <span>
            {t.root.verse} {item.verse.verse_number}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {t.verse.juz} {item.verse.juz_number}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {t.verse.page} {item.verse.page}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title={t.root.copyVerse}
            aria-label={t.root.copyVerse}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <Link
            to={`/surah/${item.surah.id}/verse/${item.verse.verse_number}`}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label={t.root.verse}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 space-y-4">
        {/* Arabic verse */}
        <p
          className="text-2xl sm:text-[1.75rem] leading-loose text-foreground text-right font-arabic"
          dir="rtl"
          lang="ar"
        >
          {item.verse.verse}
        </p>

        {/* Root word in context */}
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2 shrink-0">
            {t.root.wordInContext}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
            <span
              className="text-xl font-arabic font-semibold text-foreground leading-none"
              dir="rtl"
              lang="ar"
            >
              {item.arabic}
            </span>
            {item.transcription && (
              <>
                <span className="w-px h-4 bg-primary/20 shrink-0" />
                <span className="text-xs text-muted-foreground italic">
                  {item.transcription}
                </span>
              </>
            )}
            {item.turkish && (
              <>
                <span className="w-px h-4 bg-primary/20 shrink-0" />
                <span className="text-xs text-primary font-semibold">
                  {item.turkish}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Grammatical properties */}
        {props.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label={t.root.grammaticalInfo}>
            {props.map((prop, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${PROP_COLORS[i % PROP_COLORS.length]}`}
              >
                {prop}
              </span>
            ))}
          </div>
        )}

        {/* Transliteration */}
        {item.verse.transcription && (
          <p className="text-sm text-muted-foreground italic leading-relaxed border-t border-border pt-3">
            {item.verse.transcription}
          </p>
        )}

        {/* Translation */}
        {item.verse.translation?.text && (
          <p className="text-foreground leading-relaxed text-sm border-t border-border pt-3">
            {item.verse.translation.text}
          </p>
        )}
      </div>
    </article>
  );
});

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
                <VerseCard key={item.id} item={item} t={t} language={language} />
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

