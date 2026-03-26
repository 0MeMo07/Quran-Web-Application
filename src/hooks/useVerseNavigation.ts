import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Verse } from '../api/types';

interface SurahOption {
  id: number;
  name: string;
  page_number?: number;
}

interface UseVerseNavigationProps {
  verses: Verse[];
  surahs: SurahOption[];
  setCurrentPage: (page: number) => void;
  setInputPage: (page: string) => void;
  setCurrentSurahId: (id: number) => void;
  setHighlightedVerse: (payload: { surahId: number; verseNumber: number } | null) => void;
  pendingVerseJump: { surahId: number; verseNumber: number } | null;
  setPendingVerseJump: (payload: { surahId: number; verseNumber: number } | null) => void;
  clearPendingVerseJump: () => void;
}

export function useVerseNavigation({
  verses,
  surahs,
  setCurrentPage,
  setInputPage,
  setCurrentSurahId,
  setHighlightedVerse,
  pendingVerseJump,
  setPendingVerseJump,
  clearPendingVerseJump,
}: UseVerseNavigationProps) {
  const navigate = useNavigate();

  const triggerHighlight = useCallback((surahId: number, verseNumber: number, delay = 100) => {
    setTimeout(() => {
      setHighlightedVerse({ surahId, verseNumber });
      
      const verseElement = document.querySelector(
        `[data-verse-id="${verseNumber}"][data-surah-id="${surahId}"]`
      );
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setTimeout(() => {
        setHighlightedVerse(null);
      }, 5000);
    }, delay);
  }, [setHighlightedVerse]);

  const navigateToVerse = useCallback((surahId: number, verseNumber: number, surahStartPage?: number) => {
    const targetVerse = verses.find(
      (v) => v.surah_id === surahId && v.verse_number === verseNumber
    );

    if (targetVerse) {
      setCurrentPage(targetVerse.page);
      setInputPage(targetVerse.page.toString());
      setCurrentSurahId(surahId);
      navigate(`/surah/${surahId}/page/${targetVerse.page}`, { replace: true });
      triggerHighlight(surahId, verseNumber, 300);
      clearPendingVerseJump();
    } else {
      const surah = surahs.find(s => s.id === surahId);
      const targetPage = surah?.page_number || surahStartPage || 1;

      setPendingVerseJump({ surahId, verseNumber });
      
      navigate(`/surah/${surahId}/page/${targetPage}`, { replace: true });
      setCurrentPage(targetPage);
      setInputPage(targetPage.toString());
      setCurrentSurahId(surahId);
    }
  }, [verses, surahs, navigate, setCurrentPage, setInputPage, setCurrentSurahId, triggerHighlight, setPendingVerseJump, clearPendingVerseJump]);

  useEffect(() => {
    if (!pendingVerseJump) return;

    const targetVerse = verses.find(
      (v) => v.surah_id === pendingVerseJump.surahId && v.verse_number === pendingVerseJump.verseNumber
    );

    if (targetVerse) {
      const pageToSet = targetVerse.page;
      setCurrentPage(pageToSet);
      setInputPage(pageToSet.toString());
      
      navigate(`/surah/${pendingVerseJump.surahId}/page/${pageToSet}`, { replace: true });
      
      triggerHighlight(pendingVerseJump.surahId, pendingVerseJump.verseNumber, 500);
      clearPendingVerseJump();
    }
  }, [verses, pendingVerseJump, navigate, setCurrentPage, setInputPage, triggerHighlight, clearPendingVerseJump]);

  return { navigateToVerse, triggerHighlight };
}
