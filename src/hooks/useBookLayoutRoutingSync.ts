import { useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { type NavigateFunction } from 'react-router-dom';
import { type Verse } from '../api/types';

interface SurahOption {
  id: number;
  name: string;
}

interface UseBookLayoutRoutingSyncParams {
  verses: Verse[];
  surahs: SurahOption[];
  searchSurah: string;
  searchVerse: string;
  closeDropdowns: () => void;
  surahId?: string;
  verseId?: string;
  urlPageNumber?: string;
  currentPage: number;
  totalPages: number;
  currentSurahId: number | null;
  currentPageVerses: Verse[];
  locationState: unknown;
  navigate: NavigateFunction;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setInputPage: Dispatch<SetStateAction<string>>;
  setCurrentSurahIdInStore: (surahId: number) => void;
}

function highlightVerse(surahId: number, verseNumber: number, delay = 300) {
  setTimeout(() => {
    const verseElement = document.querySelector(
      `[data-verse-id="${verseNumber}"][data-surah-id="${surahId}"]`
    );

    if (!verseElement) {
      return;
    }

    verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');

    setTimeout(() => {
      verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
    }, 2000);
  }, delay);
}

export function useBookLayoutRoutingSync({
  verses,
  surahs,
  searchSurah,
  searchVerse,
  closeDropdowns,
  surahId,
  verseId,
  urlPageNumber,
  currentPage,
  totalPages,
  currentSurahId,
  currentPageVerses,
  locationState,
  navigate,
  setCurrentPage,
  setInputPage,
  setCurrentSurahIdInStore,
}: UseBookLayoutRoutingSyncParams) {
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const targetSurah = surahs.find((s) => s.name === searchSurah);

      if (targetSurah) {
        const targetVerse = verses.find(
          (v) => v.surah_id === targetSurah.id && v.verse_number === Number(searchVerse)
        );

        if (targetVerse) {
          navigate(`/surah/${targetSurah.id}/page/${targetVerse.page}`, { replace: true });
          setCurrentPage(targetVerse.page);
          setInputPage(targetVerse.page.toString());
          setCurrentSurahIdInStore(targetSurah.id);
          highlightVerse(targetSurah.id, targetVerse.verse_number, 500);
        }
      }

      closeDropdowns();
    },
    [
      navigate,
      searchSurah,
      searchVerse,
      setCurrentPage,
      setCurrentSurahIdInStore,
      setInputPage,
      closeDropdowns,
      surahs,
      verses,
    ]
  );

  useEffect(() => {
    const updateCurrentSurah = () => {
      const verseElements = document.querySelectorAll('[data-surah-id]');
      const headerHeight = 200;

      let detectedSurahId: number | null = null;
      for (const element of verseElements) {
        const rect = element.getBoundingClientRect();
        const id = Number(element.getAttribute('data-surah-id'));

        if (rect.top <= headerHeight) {
          detectedSurahId = id;
        }
      }

      if (detectedSurahId !== null && detectedSurahId !== currentSurahId) {
        setCurrentSurahIdInStore(detectedSurahId);
      }
    };

    window.addEventListener('scroll', updateCurrentSurah);
    updateCurrentSurah();

    return () => {
      window.removeEventListener('scroll', updateCurrentSurah);
    };
  }, [currentPage, currentSurahId, setCurrentSurahIdInStore]);

  useEffect(() => {
    if (currentPageVerses.length > 0) {
      const firstSurahId = currentPageVerses[0].surah_id;
      setCurrentSurahIdInStore(firstSurahId);

      if (!surahId && !verseId && currentPage > 0) {
        navigate(`/surah/${firstSurahId}/page/${currentPage}`, { replace: true });
      }
    }
  }, [currentPage, currentPageVerses, navigate, setCurrentSurahIdInStore, surahId, verseId]);

  useEffect(() => {
    if (surahId && verseId) {
      const targetVerse = verses.find(
        (v) => v.surah_id === Number(surahId) && v.verse_number === Number(verseId)
      );

      if (targetVerse) {
        setCurrentPage(targetVerse.page);
        setInputPage(targetVerse.page.toString());
        setCurrentSurahIdInStore(Number(surahId));
        highlightVerse(Number(surahId), targetVerse.verse_number, 300);
      }
      return;
    }

    if (surahId && urlPageNumber) {
      const pageNum = Number(urlPageNumber);
      if (!Number.isNaN(pageNum) && pageNum >= 0 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        setInputPage(pageNum.toString());
        setCurrentSurahIdInStore(Number(surahId));
        window.scrollTo(0, 0);
      }
      return;
    }

    if (surahId && !verseId) {
      const stateVerse = (locationState as { targetVerseId?: unknown } | null)?.targetVerseId;
      const targetVerseNumber = stateVerse ? Number(stateVerse) : null;

      const firstVerseOfSurah = targetVerseNumber
        ? verses.find(
            (v) => v.surah_id === Number(surahId) && v.verse_number === targetVerseNumber
          )
        : verses.find((v) => v.surah_id === Number(surahId));

      if (firstVerseOfSurah) {
        const pageToSet = firstVerseOfSurah.page;
        setCurrentPage(pageToSet);
        setInputPage(pageToSet.toString());
        setCurrentSurahIdInStore(Number(surahId));
        navigate(`/surah/${surahId}/page/${pageToSet}`, { replace: true });
        window.scrollTo(0, 0);

        if (targetVerseNumber) {
          highlightVerse(Number(surahId), targetVerseNumber, 500);
        }
      }
    }
  }, [
    surahId,
    verseId,
    urlPageNumber,
    verses,
    setCurrentPage,
    setCurrentSurahIdInStore,
    setInputPage,
    totalPages,
    navigate,
    locationState,
  ]);

  useEffect(() => {
    if (surahId && verseId && currentPage > 0) {
      const targetVerse = verses.find(
        (v) =>
          v.surah_id === Number(surahId) &&
          v.verse_number === Number(verseId) &&
          v.page === currentPage
      );

      if (targetVerse) {
        highlightVerse(Number(surahId), targetVerse.verse_number, 300);
      }
    }
  }, [currentPage, surahId, verseId, verses]);

  return { handleSearch };
}
