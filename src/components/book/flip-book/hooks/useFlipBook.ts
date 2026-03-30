import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllVerses, selectSurahs } from '../../../../store/slices/quranSlice';
import { selectSearchLanguage } from '../../../../store/slices/searchSlice';
import { fetchVerseById } from '../../../../api/quranApi';
import { selectSelectedAuthor } from '../../../../store/slices/translationsSlice';
import { useAudioPlayer } from '../../../../hooks/useAudioPlayer';
import { buildPageMap } from './mushafPagination';
import type { ViewType } from '../../../../store/slices/uiSlice';

export const TOTAL_QURAN_PAGES = 604;
export const LOGICAL_PAGE_WIDTH = 550;
export const LOGICAL_PAGE_HEIGHT = 800;

interface UseFlipBookProps {
  propPage?: number;
  onPageChange?: (page: number) => void;
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
}

type CoverKind = 'front' | 'back' | null;

interface FlipBookPageMeta {
  key: string;
  number: number;
  quranPageNumber: number;
  coverKind: CoverKind;
  isLeft: boolean;
}

import { selectFlippingMode } from '../../../../store/slices/uiSlice';

export function useFlipBook({
  propPage,
  onPageChange,
  viewType,
  fontSize,
  lineHeight,
}: UseFlipBookProps) {
  const navigate = useNavigate();
  const surahs = useSelector(selectSurahs);
  const allVerses = useSelector(selectAllVerses);
  const language = useSelector(selectSearchLanguage);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const flippingMode = useSelector(selectFlippingMode);
  const { isPlaying, currentAudioId, playAudio, currentTime, duration, seek } = useAudioPlayer();
  
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSinglePageOverride, setIsSinglePageOverride] = useState(window.innerWidth < 1024);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [showAuthorNotes, setShowAuthorNotes] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem('showAuthorNotes') === 'true';
  });
  const [pendingVerseJump, setPendingVerseJump] = useState<{ surahId: number; verseNumber: number } | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrubberVisible, setIsScrubberVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => Math.max(0, propPage ?? 1));

  const bookRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = dimensions.width < 1024;
  const isSinglePageMode = isSinglePageOverride;

  const viewportScale = useMemo(() => {
    const bottomBarHeight = 64; // Increased to account for mobile safe areas and bottom bar
    const paddingMultiplier = 0.95;
    const availableW = dimensions.width * paddingMultiplier;
    const availableH = (dimensions.height - bottomBarHeight) * paddingMultiplier;
    
    const targetW = isSinglePageOverride ? LOGICAL_PAGE_WIDTH : LOGICAL_PAGE_WIDTH * 2;
    const targetH = LOGICAL_PAGE_HEIGHT;
    const scaleW = availableW / targetW;
    const scaleH = availableH / targetH;
    return Math.min(scaleW, scaleH);
  }, [dimensions.width, dimensions.height, isSinglePageOverride]);

  useEffect(() => {
    setZoomLevel(1);
  }, [isSinglePageOverride]);

  // Handle scrolling to current page when switching to single page mode
  useEffect(() => {
    if (isSinglePageMode && scrollContainerRef.current) {
      // Small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        const el = document.getElementById(`quran-page-${currentPage}`);
        if (el && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = el.offsetTop;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSinglePageMode]);

  const totalBookWidth = isSinglePageMode ? LOGICAL_PAGE_WIDTH : LOGICAL_PAGE_WIDTH * 2;
  const scaledWidth = totalBookWidth * viewportScale * zoomLevel;
  const scaledHeight = LOGICAL_PAGE_HEIGHT * viewportScale * zoomLevel;
  
  const dragMarginX = Math.max(0, (scaledWidth - dimensions.width) / 2);
  const dragMarginY = Math.max(0, (scaledHeight - (dimensions.height - 48)) / 2 + 50); 

  const pageLayout = useMemo(
    () =>
      buildPageMap({
        verses: allVerses,
        surahs,
        pageWidth: LOGICAL_PAGE_WIDTH,
        pageHeight: LOGICAL_PAGE_HEIGHT,
        viewType,
        fontSize,
        lineHeight,
        showAuthorNotes,
        safeInsets: {
          top: 20,
          right: 22,
          bottom: 38,
          left: 22,
        },
      }),
    [allVerses, surahs, viewType, fontSize, lineHeight, showAuthorNotes],
  );

  useEffect(() => {
    localStorage.setItem('showAuthorNotes', String(showAuthorNotes));
  }, [showAuthorNotes]);

  const quranPageCount = useMemo(() => {
    const maxSurahPage = surahs.reduce((maxPage, surah) => Math.max(maxPage, surah.page_number), 1);
    const maxVersePage = allVerses.reduce((maxPage, verse) => Math.max(maxPage, Math.max(1, verse.page)), 1);
    return Math.max(
      1,
      maxSurahPage,
      maxVersePage,
      pageLayout.maxPageNumber,
      propPage ?? 1,
    );
  }, [surahs, allVerses, pageLayout.maxPageNumber, propPage]);

  const hasCovers = true;

  const quranPageToIndex = useCallback(
    (quranPage: number) => {
      const clampedPage = Math.max(1, Math.min(quranPageCount, quranPage));
      return hasCovers ? clampedPage : clampedPage - 1;
    },
    [hasCovers, quranPageCount],
  );

  const indexToQuranPage = useCallback(
    (index: number) => {
      const mapped = hasCovers ? index : index + 1;
      return Math.max(1, Math.min(quranPageCount, mapped));
    },
    [hasCovers, quranPageCount],
  );

  const totalPageCount = quranPageCount + (hasCovers ? 2 : 0);

  const pages = useMemo(() => {
    if (!hasCovers) {
      return Array.from({ length: totalPageCount }, (_, index) => {
        const pageNumber = index + 1;
        return {
          key: `quran-${pageNumber}`,
          number: pageNumber,
          quranPageNumber: pageNumber,
          coverKind: null,
          isLeft: pageNumber % 2 === 0,
        } as FlipBookPageMeta;
      });
    }

    return Array.from({ length: totalPageCount }, (_, index) => {
      const physicalPageNumber = index + 1;
      const isFrontCover = index === 0;
      const isBackCover = index === totalPageCount - 1;
      const quranPageNumber = indexToQuranPage(index);

      return {
        key: isFrontCover ? 'cover-front' : isBackCover ? 'cover-back' : `quran-${quranPageNumber}`,
        number: quranPageNumber,
        quranPageNumber,
        coverKind: isFrontCover ? 'front' : isBackCover ? 'back' : null,
        isLeft: physicalPageNumber % 2 === 0,
      } as FlipBookPageMeta;
    });
  }, [hasCovers, totalPageCount, indexToQuranPage]);

  useEffect(() => {
    if (propPage === undefined) {
      return;
    }

    const incomingPageIndex = quranPageToIndex(propPage);
    setCurrentPage((previousPage) => {
      if (incomingPageIndex === previousPage) {
        return previousPage;
      }

      if (!isSinglePageMode) {
        bookRef.current?.pageFlip()?.turnToPage(incomingPageIndex);
      }

      return incomingPageIndex;
    });
  }, [propPage, isSinglePageMode, quranPageToIndex]);

  const currentSurahOnPage = useMemo(() => {
    const pageNum = pages[currentPage]?.quranPageNumber || 1;
    return [...surahs].sort((a, b) => b.page_number - a.page_number).find(s => s.page_number <= pageNum);
  }, [currentPage, pages, surahs]);

  useEffect(() => {
    if (pages.length > 0 && currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  const handlePageJump = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(pages.length - 1, index));

    if (isSinglePageMode) {
      setCurrentPage(nextIndex);
      const el = document.getElementById(`quran-page-${nextIndex}`);
      if (el && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      }
    } else {
      bookRef.current?.pageFlip()?.turnToPage(nextIndex);
    }
  }, [isSinglePageMode, pages.length]);

  const navigateToVerseInBookMode = useCallback((surahId: number, verseNumber: number, fallbackPage: number) => {
    const targetVerse = allVerses.find(
      (v) => v.surah_id === surahId && v.verse_number === verseNumber,
    );

    if (targetVerse) {
      const pageIndex = quranPageToIndex(targetVerse.page);
      handlePageJump(pageIndex);
      navigate(`/surah/${surahId}/page/${targetVerse.page}`, { replace: true });
      setPendingVerseJump(null);
      return;
    }

    // Verse may not be loaded yet in incremental book fetches; fall back to surah page first.
    setPendingVerseJump({ surahId, verseNumber });
    const fallbackIndex = quranPageToIndex(fallbackPage);
    handlePageJump(fallbackIndex);
    navigate(`/surah/${surahId}/page/${fallbackPage}`, { replace: true });
  }, [allVerses, quranPageToIndex, handlePageJump, navigate]);

  const resolveVersePage = useCallback(
    async (surahId: number, verseNumber: number): Promise<number | null> => {
      const cachedVersePage = allVerses.find(
        (verse) => verse.surah_id === surahId && verse.verse_number === verseNumber,
      )?.page;

      if (cachedVersePage) {
        return cachedVersePage;
      }

      try {
        const verse = await fetchVerseById(surahId, verseNumber, selectedAuthor?.id);
        return verse?.page ?? null;
      } catch {
        return null;
      }
    },
    [allVerses, selectedAuthor?.id],
  );

  useEffect(() => {
    if (!pendingVerseJump) {
      return;
    }

    const targetVerse = allVerses.find(
      (v) =>
        v.surah_id === pendingVerseJump.surahId &&
        v.verse_number === pendingVerseJump.verseNumber,
    );

    if (!targetVerse) {
      return;
    }

    const pageIndex = quranPageToIndex(targetVerse.page);
    handlePageJump(pageIndex);
    navigate(`/surah/${pendingVerseJump.surahId}/page/${targetVerse.page}`, { replace: true });
    setPendingVerseJump(null);
  }, [allVerses, handlePageJump, navigate, pendingVerseJump, quranPageToIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

  const handleSearch = async () => {
    if (!selectedSurah) return;

    const selectedSurahId = Number(selectedSurah);
    const selectedSurahMeta = surahs.find((s) => s.id === selectedSurahId);
    const fallbackPage = selectedSurahMeta?.page_number;

    if (!fallbackPage) {
      return;
    }

    const requestedVerse = selectedVerse.trim();
    const verseNumber = Number(requestedVerse);
    const hasValidVerseInput =
      requestedVerse.length > 0 &&
      Number.isInteger(verseNumber) &&
      verseNumber >= 1 &&
      (!selectedSurahMeta?.verse_count || verseNumber <= selectedSurahMeta.verse_count);

    if (hasValidVerseInput) {
      const exactPage = await resolveVersePage(selectedSurahId, verseNumber);
      if (exactPage) {
        const pageIndex = quranPageToIndex(exactPage);
        setPendingVerseJump(null);
        handlePageJump(pageIndex);
        navigate(`/surah/${selectedSurahId}/page/${exactPage}`, { replace: true });
        return;
      }

      navigateToVerseInBookMode(selectedSurahId, verseNumber, fallbackPage);
      return;
    }

    setPendingVerseJump(null);
    const pageIndex = quranPageToIndex(fallbackPage);
    handlePageJump(pageIndex);
    navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
  };

  const handleSurahSelectChange = (value: string) => {
    setSelectedSurah(value);
    setPendingVerseJump(null);
    if (!value) return;

    const selectedSurahId = Number(value);
    const selectedSurahMeta = surahs.find((s) => s.id === selectedSurahId);
    if (selectedSurahMeta?.page_number && !selectedVerse.trim()) {
      const fallbackPage = selectedSurahMeta.page_number;
      const pageIndex = quranPageToIndex(fallbackPage);
      handlePageJump(pageIndex);
      navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
    }
  };

  const onPage = useCallback((e: any) => {
    const newPage = e.data;
    setCurrentPage(newPage);
    if (!onPageChange) {
      return;
    }

    const pageMeta = pages[newPage];
    if (!pageMeta || pageMeta.coverKind) {
      return;
    }

    onPageChange(pageMeta.quranPageNumber);
  }, [onPageChange, pages]);

  const handleAudioToggle = () => {
    if (currentSurahOnPage) {
      const audioUrl = language === "tr" ? currentSurahOnPage.audio.mp3 : currentSurahOnPage.audio.mp3_en;
      playAudio(audioUrl, currentSurahOnPage.id);
    }
  };

  useEffect(() => {
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        if (isSinglePageMode) {
          handlePageJump(Math.min(pages.length - 1, currentPage + 1));
        } else {
          bookRef.current?.pageFlip()?.flipNext();
        }
      }
      if (e.key === 'ArrowLeft') {
        if (isSinglePageMode) {
          handlePageJump(Math.max(0, currentPage - 1));
        } else {
          bookRef.current?.pageFlip()?.flipPrev();
        }
      }
      if (e.key === 'f') toggleFullscreen();
      if (e.key === '=' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleZoomIn(); }
      if (e.key === '-' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleZoomOut(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSinglePageMode, currentPage, pages, handlePageJump, handleZoomIn, handleZoomOut, toggleFullscreen]);

  return {
    dimensions,
    isFullscreen,
    zoomLevel,
    isSinglePageOverride,
    setIsSinglePageOverride,
    selectedSurah,
    setSelectedSurah,
    selectedVerse,
    setSelectedVerse,
    showAuthorNotes,
    setShowAuthorNotes,
    isNavOpen,
    setIsNavOpen,
    isScrubberVisible,
    setIsScrubberVisible,
    currentPage,
    setCurrentPage,
    bookRef,
    scrollContainerRef,
    isMobile,
    isSinglePageMode,
    viewportScale,
    pages,
    currentSurahOnPage,
    dragMarginX,
    dragMarginY,
    handlePageJump,
    toggleFullscreen,
    handleZoomIn,
    handleZoomOut,
    handleSearch,
    handleSurahSelectChange,
    onPage,
    handleAudioToggle,
    isPlaying,
    currentAudioId,
    currentTime,
    duration,
    seek,
    surahs,
    viewType,
    flippingMode,
    pageLayoutsByNumber: pageLayout.pagesByNumber,
    safeArea: pageLayout.safeArea,
    safeInsets: pageLayout.safeInsets,
  };
}
