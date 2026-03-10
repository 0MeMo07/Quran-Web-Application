import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, BookOpen, Loader2,
  MessageSquare, Share2, Home, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVerseById, fetchVerseParts, fetchAuthors } from '../api/quranApi';
import type { Verse, VersePart } from '../api/types';
import { useTranslations } from '../translations';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { selectSurahs } from '../store/slices/quranSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { selectNotes, addNote, deleteNote } from '../store/slices/uiSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShareMenu } from '../components/ShareMenu';
import { NotePopup } from '../components/notes/NotePopup';
import { DeleteNotePopup } from '../components/notes/DeleteNotePopup';


// ─── Word Row (table) ─────────────────────────────────────────────────────────

function WordRow({ part, index, language }: { part: VersePart; index: number; language: string }) {
  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);
  const transcription = language === 'en'
    ? (part.transcription_en || part.transcription_tr)
    : (part.transcription_tr || part.transcription_en);
  return (
    <tr className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      {/* Index */}
      <td className="py-3 px-3 text-center align-middle w-8">
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-mono">{index}</span>
      </td>
      {/* Arabic word + transcription */}
      <td className="py-3 px-3 text-right align-middle" dir="rtl">
        <p className="text-xl font-arabic text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-relaxed">{part.arabic}</p>
        {transcription && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5" dir="ltr">{transcription}</p>
        )}
      </td>
      {/* Meaning */}
      <td className="py-3 px-3 align-middle">
        <span className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{meaning}</span>
      </td>
      {/* Root */}
      <td className="py-3 px-3 text-center align-middle">
        {part.root ? (
          <Link
            to={`/root/${encodeURIComponent(part.root.latin)}`}
            className="inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors border border-emerald-100 dark:border-emerald-800/50"
            title={part.root.latin}
          >
            <span className="font-arabic text-base leading-tight" dir="rtl">{part.root.arabic}</span>
            <span className="text-xs font-mono text-emerald-500 leading-none">{part.root.latin}</span>
          </Link>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
        )}
      </td>
    </tr>
  );
}
// ─── Translation Block ───────────────────────────────────────────────────────
function TranslationBlock({
  verse,
  isPrimary = false,
}: {
  verse: Verse;
  isPrimary?: boolean;
}) {
  const [showFootnotes, setShowFootnotes] = useState(false);
  const t = useTranslations();
  return (
    <div className={`px-5 py-4 ${isPrimary ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}>
      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
        {verse.translation?.author?.name}
        {verse.translation?.author?.language && (
          <span className="text-gray-400 normal-case font-normal">
            ({verse.translation.author.language.toUpperCase()})
          </span>
        )}
        {isPrimary && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-300 normal-case font-medium tracking-normal">
            {t.versePage.translations}
          </span>
        )}
      </p>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
        {verse.translation?.text}
      </p>
      {verse.translation?.footnotes && verse.translation.footnotes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowFootnotes((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
          >
            {showFootnotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showFootnotes ? t.verse.hideFootnotes : t.verse.showFootnotes}
            <span className="text-gray-400">({verse.translation.footnotes.length})</span>
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
  );
}

// ─── Main VersePage ──────────────────────────────────────────────────────────
export function VersePage() {
  const { surahId, verseId, authorId: urlAuthorId } = useParams<{
    surahId: string;
    verseId: string;
    authorId?: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);
  const globalAuthor = useSelector(selectSelectedAuthor);
  const notes = useSelector(selectNotes);

  const surahIdNum = Number(surahId);
  const verseNum = Number(verseId);

  // Effective primary author
  const primaryAuthorId = urlAuthorId ? Number(urlAuthorId) : globalAuthor?.id;

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [verseError, setVerseError] = useState(false);

  const [parts, setParts] = useState<VersePart[] | null>(null);
  const [loadingParts, setLoadingParts] = useState(true);

  const [allTranslations, setAllTranslations] = useState<Verse[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(true);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const surahInfo = surahs.find((s) => s.id === surahIdNum);
  const existingNote = notes.find(
    (n) => n.surahId === surahIdNum && n.verseId === verseNum
  );

  // Fetch primary verse
  useEffect(() => {
    if (!surahId || !verseId) return;
    setLoadingVerse(true);
    setVerseError(false);
    fetchVerseById(surahIdNum, verseNum, primaryAuthorId)
      .then(setVerse)
      .catch(() => setVerseError(true))
      .finally(() => setLoadingVerse(false));
  }, [surahIdNum, verseNum, primaryAuthorId]);

  // Fetch word parts
  useEffect(() => {
    if (!surahId || !verseId) return;
    setLoadingParts(true);
    fetchVerseParts(surahIdNum, verseNum)
      .then(setParts)
      .catch(() => setParts(null))
      .finally(() => setLoadingParts(false));
  }, [surahIdNum, verseNum]);

  // Fetch ALL translations in parallel whenever verse changes
  useEffect(() => {
    if (!surahId || !verseId) return;
    setLoadingTranslations(true);
    setAllTranslations([]);
    fetchAuthors()
      .then((authors) =>
        Promise.allSettled(
          authors.map((a) => fetchVerseById(surahIdNum, verseNum, a.id))
        )
      )
      .then((results) => {
        const successful = results
          .filter((r): r is PromiseFulfilledResult<Verse> => r.status === 'fulfilled')
          .map((r) => r.value)
          .filter((v) => v.translation?.text);
        // Sort: primary author first, then by author name
        successful.sort((a, b) => {
          if (a.translation?.author?.id === primaryAuthorId) return -1;
          if (b.translation?.author?.id === primaryAuthorId) return 1;
          return (a.translation?.author?.name || '').localeCompare(b.translation?.author?.name || '');
        });
        setAllTranslations(successful);
      })
      .catch(() => {})
      .finally(() => setLoadingTranslations(false));
  }, [surahIdNum, verseNum]);

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      dispatch(addNote({
        id: Date.now().toString(),
        verseId: verseNum,
        surahId: surahIdNum,
        surahName: surahInfo?.name || verse?.surah?.name || '',
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
      }));
      setShowNotePopup(false);
      setNoteContent('');
    }
  };

  const handleDeleteNote = () => {
    dispatch(deleteNote({ surahId: surahIdNum, verseId: verseNum }));
    setShowDeleteConfirm(false);
  };

  const verseCount = verse?.surah?.verse_count || surahInfo?.verse_count || 0;
  const surahName = language === 'en'
    ? (verse?.surah?.name_en || surahInfo?.name_en || `Surah ${surahId}`)
    : (verse?.surah?.name || surahInfo?.name || `Sure ${surahId}`);

  const verseShareText = verse?.translation?.text || '';
  const verseShareInfo = `${surahName} ${verseNum}`;
  const verseShareLink = `/surah/${surahId}/verse/${verseId}`;

  if (loadingVerse && !verse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (verseError || (!loadingVerse && !verse)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{t.errors.loadingFailed}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            {t.errors.backToHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(`/surah/${surahId}`)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Link
              to={`/surah/${surahId}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{surahName}</span>
            </Link>
            <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">
              — {t.verse.verse} {verseNum}
            </span>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              disabled={verseNum <= 1}
              onClick={() => navigate(`/surah/${surahId}/verse/${verseNum - 1}`)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t.versePage.prevVerse}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center">
              {verseNum} / {verseCount}
            </span>
            <button
              disabled={verseCount > 0 && verseNum >= verseCount}
              onClick={() => navigate(`/surah/${surahId}/verse/${verseNum + 1}`)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t.versePage.nextVerse}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Verse hero card ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Reference bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-emerald-50/60 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              <BookOpen className="w-4 h-4" />
              <span>{surahName} — {t.verse.verse} {verseNum}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{t.verse.juz} {verse?.juz_number}</span>
              <span>·</span>
              <span>{t.verse.page} {verse?.page}</span>
            </div>
          </div>

          {/* Arabic text */}
          <div className="px-6 pt-8 pb-4">
            <p
              className="text-4xl font-arabic leading-loose text-right text-gray-900 dark:text-white"
              dir="rtl"
              lang="ar"
            >
              {verse?.verse}
            </p>
          </div>

          {/* Transliteration */}
          {verse && (
            <div className="px-6 pb-5">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 italic leading-relaxed">
                {language === 'en' ? verse.transcription_en : verse.transcription}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-6 pb-4">
            <button
              onClick={() => {
                if (!existingNote) {
                  setNoteContent('');
                  setShowNotePopup(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                existingNote
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={existingNote ? t.notes.editNote : t.notes.addNote}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {existingNote ? t.notes.editNote : t.notes.addNote}
            </button>
            <button
              onClick={() => setShowShareMenu(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {t.share.share}
            </button>
          </div>
        </div>

        {/* ── Two-column: Words + Translations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Word-by-Word table ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t.detail.wordAnalysis}
              </h2>
              {parts && (
                <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {parts.length}
                </span>
              )}
            </div>

            {loadingParts ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : parts && parts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <th className="text-center py-2.5 px-3 w-8 font-medium">#</th>
                      <th className="text-right py-2.5 px-3 font-medium">{language === 'en' ? 'Word' : 'Kelime'}</th>
                      <th className="text-left py-2.5 px-3 font-medium">{language === 'en' ? 'Meaning' : 'Anlam'}</th>
                      <th className="text-center py-2.5 px-3 font-medium">{language === 'en' ? 'Root' : 'Kök'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...parts].sort((a, b) => a.sort_number - b.sort_number).map((part, i) => (
                      <WordRow key={part.id} part={part} index={i + 1} language={language} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                {t.detail.noPartsAvailable}
              </p>
            )}
          </div>

          {/* ── Translations panel ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t.versePage.translations}
              </h2>
              {!loadingTranslations && (
                <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {allTranslations.length}
                </span>
              )}
            </div>

            {loadingTranslations ? (
              <div className="flex flex-col gap-4 p-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700" />
                    <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700" />
                    <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto max-h-[520px]">
                {allTranslations.map((v) => (
                  <TranslationBlock
                    key={v.translation?.author?.id}
                    verse={v}
                    isPrimary={v.translation?.author?.id === primaryAuthorId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Note ── */}
        {existingNote && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t.notes.myNotes}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setNoteContent(existingNote.content); setShowNotePopup(true); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-xs"
                >
                  {t.notes.editNote}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
              {existingNote.content}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t.notes.savedAt} {new Date(existingNote.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
            </p>
          </div>
        )}

        {/* ── Prev / Next navigation ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <button
            disabled={verseNum <= 1}
            onClick={() => navigate(`/surah/${surahId}/verse/${verseNum - 1}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.versePage.prevVerse}
          </button>

          <Link
            to={`/surah/${surahId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {t.versePage.backToSurah}
          </Link>

          <button
            disabled={verseCount > 0 && verseNum >= verseCount}
            onClick={() => navigate(`/surah/${surahId}/verse/${verseNum + 1}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {t.versePage.nextVerse}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <ShareMenu
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        verseText={verseShareText}
        verseInfo={verseShareInfo}
        verseLink={verseShareLink}
      />
      <NotePopup
        isOpen={showNotePopup}
        onClose={() => { setShowNotePopup(false); setNoteContent(''); }}
        onSave={handleSaveNote}
        content={noteContent}
        onChange={setNoteContent}
        verseNumber={verseNum}
        verseText={verse?.translation?.text}
        isEditing={!!existingNote}
        t={t}
      />
      <DeleteNotePopup
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteNote}
        t={t}
      />
    </div>
  );
}
