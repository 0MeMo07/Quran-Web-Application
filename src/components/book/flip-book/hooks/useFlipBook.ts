import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectSurahs } from '../../../../store/slices/quranSlice';
import { selectSearchLanguage } from '../../../../store/slices/searchSlice';
import { useAudioPlayer } from '../../../../hooks/useAudioPlayer';

// Standard Quran has 604 pages
export const TOTAL_QURAN_PAGES = 604;
export const LOGICAL_PAGE_WIDTH = 550;
export const LOGICAL_PAGE_HEIGHT = 800;

interface UseFlipBookProps {
  propPage?: number;
  onPageChange?: (page: number) => void;
  t: any;
}

export function useFlipBook({ propPage, onPageChange }: UseFlipBookProps) {
  const navigate = useNavigate();
  const surahs = useSelector(selectSurahs);
  const language = useSelector(selectSearchLanguage);
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrubberVisible, setIsScrubberVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(propPage || 0);

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

  useEffect(() => {
    if (propPage !== undefined && propPage !== currentPage) {
      setCurrentPage(propPage);
      if (!isSinglePageMode) {
        bookRef.current?.pageFlip()?.turnToPage(propPage);
      }
    }
  }, [propPage, isSinglePageMode]);

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

  const pages = useMemo(() => {
    return Array.from({ length: TOTAL_QURAN_PAGES }, (_, index) => {
      const pageNumber = index + 1;
      return {
        number: pageNumber,
        isLeft: pageNumber % 2 === 0,
      };
    });
  }, []);

  const currentSurahOnPage = useMemo(() => {
    const pageNum = pages[currentPage]?.number || 1;
    return [...surahs].sort((a, b) => b.page_number - a.page_number).find(s => s.page_number <= pageNum);
  }, [currentPage, pages, surahs]);

  useEffect(() => {
    if (pages.length > 0 && currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  const handlePageJump = useCallback((index: number) => {
    if (isSinglePageMode) {
      setCurrentPage(index);
      const el = document.getElementById(`quran-page-${index}`);
      if (el && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      }
    } else {
      bookRef.current?.pageFlip()?.turnToPage(index);
    }
  }, [isSinglePageMode]);

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

  const handleSearch = () => {
    if (!selectedSurah) return;
    const selectedSurahId = Number(selectedSurah);
    const selectedSurahMeta = surahs.find((s) => s.id === selectedSurahId);
    
    if (selectedSurahMeta?.page_number) {
      const fallbackPage = selectedSurahMeta.page_number;
      const pageIndex = Math.max(0, fallbackPage - 1);
      handlePageJump(pageIndex);
      navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
    }
  };

  const handleSurahSelectChange = (value: string) => {
    setSelectedSurah(value);
    if (!value) return;

    const selectedSurahId = Number(value);
    const selectedSurahMeta = surahs.find((s) => s.id === selectedSurahId);
    if (selectedSurahMeta?.page_number && !selectedVerse.trim()) {
      const fallbackPage = selectedSurahMeta.page_number;
      const pageIndex = Math.max(0, fallbackPage - 1);
      handlePageJump(pageIndex);
      navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
    }
  };

  const onPage = useCallback((e: any) => {
    const newPage = e.data;
    setCurrentPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [onPageChange]);

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
  };
}
