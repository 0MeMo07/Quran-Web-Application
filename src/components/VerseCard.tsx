import { useState, useEffect } from 'react';
import { Share2, BookOpen, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import type { Verse } from '../api/types';
import { ShareMenu } from './ShareMenu';
import { useTranslations } from '../translations';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentSurah, selectSurahs } from '../store/slices/quranSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { selectReadingType, addNote, selectNotes, deleteNote } from '../store/slices/uiSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { CardNoteSection } from './notes/CardNoteSection';
import { NotePopup } from './notes/NotePopup';
import { DeleteNotePopup } from './notes/DeleteNotePopup';
import { motion } from 'framer-motion';

interface VerseCardProps {
  verse: Verse;
}

export function VerseCard({ verse }: VerseCardProps) {
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const readingType = useSelector(selectReadingType);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const currentSurah = useSelector(selectCurrentSurah);
  const surahs = useSelector(selectSurahs);
  const { surahId, verseId } = useParams();
  const dispatch = useDispatch();
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const notes = useSelector(selectNotes);
  const existingNote = notes.find(note => note.verseId === verse.verse_number);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const selectedSurah = surahs.find((surah) => surah.id === currentSurah);
  const verseInfo = `${selectedSurah?.name}, Verse ${verse.verse_number}`;
  const verseText = `\n${verse.translation?.text || ''}`;
  const verseLink = selectedAuthor
    ? `/surah/${verse.surah_id}/verse/${verse.verse_number}/${selectedAuthor.id}`
    : `/surah/${verse.surah_id}/verse/${verse.verse_number}`;

  useEffect(() => {
    if (surahId && verseId) {
      if (verse.surah_id === Number(surahId) && verse.verse_number === Number(verseId)) {
        setTimeout(() => {
          const verseElement = document.querySelector(`[data-verse-id="${verse.id}"]`);
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-primary/10');
            setTimeout(() => {
              verseElement.classList.remove('bg-primary/10');
            }, 2000);
          }
        }, 500);
      }
    }
  }, [surahId, verseId, verse.id, verse.surah_id, verse.verse_number]);

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      const newNote = {
        id: Date.now().toString(),
        verseId: verse.verse_number,
        surahId: verse.surah_id,
        surahName: selectedSurah?.name || '',
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
      };
      dispatch(addNote(newNote));
      setShowNotePopup(false);
      setNoteContent('');
      setIsEditing(false);
    }
  };

  const handleEditClick = (content: string) => {
    setNoteContent(content);
    setShowNotePopup(true);
    setIsEditing(true);
  };

  const handleDeleteNote = () => {
    dispatch(deleteNote({ surahId: verse.surah_id, verseId: verse.verse_number }));
    setShowDeleteConfirmation(false);
  };

  if (readingType === 'book') {
    return null;
  }

  return (
    <>
      {verse.verse_number === 1 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 mt-16 relative"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-px bg-primary/20 mb-8" />
            <h1 className="text-center font-serif text-4xl sm:text-6xl tracking-tight text-foreground mb-4">
              {selectedSurah?.name}
            </h1>
            <div className="flex items-center gap-3 text-sm font-numbers tracking-widest uppercase opacity-40">
              <span>{t.verse.juz} {verse.juz_number}</span>
              <span className="w-1 h-1 rounded-full bg-foreground" />
              <span>{t.verse.page} {verse.page}</span>
            </div>
          </div>
        </motion.section>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        data-verse-id={verse.id}
        className="glass rounded-[2rem] p-8 transition-all duration-500 hover:translate-y-[-4px] group/card mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 transition-colors group-hover/card:bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <Link 
                to={verseLink}
                className="group/link text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors block"
              >
                {t.verse.verse} <span className="font-numbers">{verse.verse_number}</span>
              </Link>
              <p className="text-sm font-numbers tracking-wider uppercase opacity-40 mt-1">
                {t.verse.juz} {verse.juz_number} • {t.verse.page} {verse.page}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => !existingNote && setShowNotePopup(true)}
              className={`p-2 rounded-lg transition-colors shadow-lg ${
                existingNote 
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
                  : 'bg-surface text-foreground hover:bg-secondary'
              }`}
              title={existingNote ? t.notes.editNote : t.notes.addNote}
              disabled={!!existingNote}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowShareMenu(true)}
              className="p-2 rounded-lg bg-surface text-foreground hover:bg-secondary transition-colors shadow-lg"
              title={t.share.share}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-4xl sm:text-5xl leading-[1.8] text-right font-arabic text-foreground selection:bg-primary/30" dir="rtl">
            {verse.verse}
          </p>
          <p className="text-base text-muted-foreground/60 leading-relaxed font-light tracking-wide lg:max-w-3xl">
            {language === 'en' ? verse.transcription_en : verse.transcription}
          </p>
          {verse.translation && (
            <div className="pt-6 border-t border-border">
              <p className="text-foreground leading-relaxed">
                {verse.translation.text}
              </p>

              {/* Dipnotlar */}
              {verse.translation.footnotes && verse.translation.footnotes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowTranslations(!showTranslations)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>{showTranslations ? t.verse.hideFootnotes : t.verse.showFootnotes}</span>
                    {showTranslations ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showTranslations && (
                    <div className="pl-4 border-l-2 border-border/50 space-y-2">
                      {verse.translation.footnotes.map((footnote) => (
                        <p key={footnote.id} className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">
                            [{footnote.number}]
                          </span>{' '}
                          {footnote.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notlar Bölümü - Sadece not varsa göster */}
              {existingNote && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>Notes</span>
                    {showNotes ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showNotes && (
                    <div className="pl-4 border-l-2 border-primary/20">
                      <CardNoteSection
                        verseId={verse.verse_number}
                        surahId={verse.surah_id}
                        onDeleteClick={() => setShowDeleteConfirmation(true)}
                        onEditClick={handleEditClick}
                        t={t}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ShareMenu
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        verseText={verseText}
        verseInfo={verseInfo}
        verseLink={verseLink}
      />

      <NotePopup
        isOpen={showNotePopup}
        onClose={() => {
          setShowNotePopup(false);
          setNoteContent('');
          setIsEditing(false);
        }}
        onSave={handleSaveNote}
        content={noteContent}
        onChange={setNoteContent}
        verseNumber={verse.verse_number}
        verseText={verse.translation?.text}
        isEditing={isEditing}
        t={t}
      />

      <DeleteNotePopup
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteNote}
        t={t}
      />
    </>
  );
}
