import { useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { type NavigateFunction } from 'react-router-dom';
import { type Verse } from '../api/types';

interface SurahOption {
  id: number;
  name: string;
  page_number?: number;
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
  minPage: number;
  currentPage: number;
  totalPages: number;
  currentSurahId: number | null;
  currentPageVerses: Verse[];
  navigate: NavigateFunction;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setInputPage: Dispatch<SetStateAction<string>>;
  setCurrentSurahIdInStore: (surahId: number) => void;
  navigateToVerse: (surahId: number, verseNumber: number, surahStartPage?: number) => void;
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
  minPage,
  currentPage,
  totalPages,
  currentSurahId,
  currentPageVerses,
  navigate,
  setCurrentPage,
  setInputPage,
  setCurrentSurahIdInStore,
  navigateToVerse,
}: UseBookLayoutRoutingSyncParams) {
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const targetSurah = surahs.find((s) => s.name === searchSurah);

      if (targetSurah) {
        navigateToVerse(targetSurah.id, Number(searchVerse), targetSurah.page_number);
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
    if (!urlPageNumber) {
      return;
    }

    const pageNum = Number(urlPageNumber);
    if (!Number.isNaN(pageNum) && pageNum >= minPage && pageNum <= totalPages) {
      setInputPage((prevPage) => (prevPage === urlPageNumber ? prevPage : urlPageNumber));
    }
  }, [urlPageNumber, minPage, totalPages, setInputPage, surahId]); // Added surahId here just for completeness, but the main fix is keeping it stable.

  useEffect(() => {
    if (surahId && verseId) {
      navigateToVerse(Number(surahId), Number(verseId));
      return;
    }

    if (surahId && !verseId && !urlPageNumber) {
      const firstVerseOfSurah = verses.find((v) => v.surah_id === Number(surahId));

      if (firstVerseOfSurah) {
        const pageToSet = firstVerseOfSurah.page;
        setInputPage(pageToSet.toString());
        setCurrentSurahIdInStore(Number(surahId));
        
        // Just sync URL if it doesn't have page
        if (!urlPageNumber) {
          navigate(`/surah/${surahId}/page/${pageToSet}`, { replace: true });
        }
        
        window.scrollTo(0, 0);
      }
    }
  }, [
    surahId,
    verseId,
    urlPageNumber,
    verses,
    setCurrentSurahIdInStore,
    setInputPage,
    navigate,
  ]);

  return { handleSearch };
}
