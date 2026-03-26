import React, { useMemo, forwardRef, useState, useEffect, useRef, useCallback, memo } from 'react';
import type { Verse } from '../../api/types';
import type { ViewType } from '../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Search, ChevronLeft, ChevronRight, BookOpen, FileText, LayoutGrid, Headphones, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
// @ts-ignore
import HTMLPageFlip from 'react-pageflip';
import { useSelector } from 'react-redux';
import { selectSurahs } from '../../store/slices/quranSlice';
import { selectSearchLanguage } from '../../store/slices/searchSlice';
import { MushafPage } from './mushaf/MushafPage';
import { useNavigate } from 'react-router-dom';

interface FlipBookContentProps {
  verses: Verse[];
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
  t: any;
}

// Replaced hardcoded TOTAL_QURAN_PAGES with dynamic calculation in the component

const Page = memo(forwardRef<HTMLDivElement, { children: React.ReactNode; number: number; total: number; isLeft?: boolean; isMobile?: boolean }>(
  (props, ref) => {
    return (
      <div 
        className={`bg-[#fdfbf7] flex flex-col h-full relative select-none overflow-hidden ${
          props.isMobile ? 'px-6 pt-6 pb-12' : 'px-10 pt-8 pb-12'
        } ${
          props.isLeft 
            ? 'rounded-l-sm shadow-[inset_-40px_0_80px_-30px_rgba(0,0,0,0.15)]' 
            : 'rounded-r-sm shadow-[inset_40px_0_80px_-30px_rgba(0,0,0,0.15)] border-l border-black/10'
        }`} 
        ref={ref}
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-0" />
        
        {/* MUSHAF FRAME */}
        <div className="absolute inset-4 border-[2px] border-primary/20 rounded-sm pointer-events-none z-0">
          <div className="absolute -inset-[3px] border-[0.5px] border-primary/15 rounded-sm" />
          
          {/* Ornate Centers */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfbf7] px-2 py-0.5 border border-primary/10 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full border border-primary/20" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#fdfbf7] px-2 py-0.5 border border-primary/10 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full border border-primary/20" />
          </div>

          {/* Ornate Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary/40 -translate-x-1.5 -translate-y-1.5 rounded-tl-md flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary/40 translate-x-1.5 -translate-y-1.5 rounded-tr-md flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary/40 -translate-x-1.5 translate-y-1.5 rounded-bl-md flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary/40 translate-x-1.5 translate-y-1.5 rounded-br-md flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col h-full">
          {props.children}
        </div>

        {/* Footer */}
        <div className={`absolute bottom-6 left-0 right-0 flex items-center justify-between px-12 text-[10px] font-bold text-primary/30 uppercase tracking-[0.3em] z-20 ${props.isMobile ? 'px-8' : 'px-16'}`}>
          <span className={props.isLeft ? 'order-1' : 'order-2 hover:text-primary transition-colors cursor-default'}>Quran-i Kerim</span>
          <span className={props.isLeft ? 'order-2' : 'order-1'}>
            <span className="text-primary/50 text-xs">{props.number}</span>
            <span className="mx-1 opacity-50">/</span>
            <span>{props.total}</span>
          </span>
        </div>

        {/* Binding Shadow */}
        <div className={`absolute top-0 bottom-0 w-20 pointer-events-none z-20 ${
          props.isLeft 
            ? 'right-0 bg-gradient-to-l from-black/20 via-black/5 to-transparent' 
            : 'left-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent'
        }`} />
      </div>
    );
  }
));

Page.displayName = 'Page';
// ---------------------------------------------------------------------------

export function FlipBookContent({ verses, viewType, fontSize, lineHeight, t }: FlipBookContentProps) {
  const navigate = useNavigate();
  const surahs = useSelector(selectSurahs);
  const language = useSelector(selectSearchLanguage);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const logicalPageWidth = 550;
  const logicalPageHeight = 800;

  const bookDimensions = useMemo(() => ({
    width: logicalPageWidth,
    height: logicalPageHeight,
  }), []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSinglePageOverride, setIsSinglePageOverride] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') bookRef.current?.pageFlip()?.flipNext();
      if (e.key === 'ArrowLeft') bookRef.current?.pageFlip()?.flipPrev();
      if (e.key === 'f') toggleFullscreen();
      if (e.key === '=' && e.metaKey) { e.preventDefault(); handleZoomIn(); }
      if (e.key === '-' && e.metaKey) { e.preventDefault(); handleZoomOut(); }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isMobile = dimensions.width < 1024;
  const isSinglePageMode = isMobile || isSinglePageOverride;

  const viewportScale = useMemo(() => {
    const bottomBarHeight = 48;
    const paddingMultiplier = isSinglePageMode ? 0.95 : 0.90;
    const availableW = dimensions.width * paddingMultiplier;
    const availableH = (dimensions.height - bottomBarHeight) * paddingMultiplier;
    const targetW = isSinglePageMode ? bookDimensions.width : bookDimensions.width * 2;
    const targetH = bookDimensions.height;
    const scaleW = availableW / targetW;
    const scaleH = availableH / targetH;
    return Math.min(scaleW, scaleH);
  }, [dimensions.width, dimensions.height, isSinglePageMode, bookDimensions.width, bookDimensions.height]);

  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => {
    if (verses.length === 0) return [];

    const grouped = verses.reduce((acc, v) => {
      if (!acc[v.page]) acc[v.page] = [];
      acc[v.page].push(v);
      return acc;
    }, {} as Record<number, Verse[]>);

    const pageNumbers = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    
    const maxDataPage = Math.max(...pageNumbers);
    
    // Mushaf always starts from Page 1 (Al-Fatiha) to maintain correct Right/Left spreads.
    // Page 1 is on the Right, Page 2 is on the Left.
    const minPage = 1;

    // Content-Driven: We only show the pages we have.
    // If maxDataPage is odd (e.g. 49), Page 49 is on the Right. 
    // We add one extra blank page at 50 (Left) to close the book for spread consistency.
    const maxPage = maxDataPage % 2 === 0 ? maxDataPage : maxDataPage + 1;
    
    const rangeLength = maxPage - minPage + 1;

    return Array.from({ length: rangeLength }, (_, index) => {
      const pageNumber = minPage + index;
      const pageVerses = grouped[pageNumber] || [];
      return {
        number: pageNumber,
        isLeft: pageNumber % 2 === 0, // In Mushaf standard: Even is Left, Odd is Right
        versesBySurah: pageVerses.reduce((sAcc, v) => {
          if (!sAcc[v.surah_id]) sAcc[v.surah_id] = { name: v.surah?.name || 'Sûre', verses: [] };
          sAcc[v.surah_id].verses.push(v);
          return sAcc;
        }, {} as Record<number, { name: string; verses: Verse[] }>),
      };
    });
  }, [verses]);

  // Guard: Ensure currentPage is within bounds when pages change
  useEffect(() => {
    if (pages.length > 0 && currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  const activeSurahObj = useMemo(() => {
    if (selectedSurah) return surahs.find(s => s.id === Number(selectedSurah));
    if (pages.length > 0 && pages[currentPage]) {
      const surahIds = Object.keys(pages[currentPage].versesBySurah);
      if (surahIds.length > 0) return surahs.find(s => s.id === Number(surahIds[0]));
    }
    return null;
  }, [selectedSurah, pages, currentPage, surahs]);

  // -------------------------------------------------------------------------
  // Page content renderer
  // -------------------------------------------------------------------------
  const renderPageContent = useCallback((
    p: { number: number; isLeft: boolean; versesBySurah: Record<number, { name: string; verses: Verse[] }> },
    _totalVerses: number
  ) => {
    const allEntries = Object.entries(p.versesBySurah);

    if (viewType === 'kuran') {
      return (
        <MushafPage
          entries={allEntries}
          pageHeight={logicalPageHeight}
          pageWidth={logicalPageWidth}
          pageNumber={p.number}
        />
      );
    }

    // MEAL / MIXED modes
    const totalVerses = Object.values(p.versesBySurah).reduce((a, d) => a + d.verses.length, 0);
    const adaptiveGap = totalVerses <= 6 ? 'gap-8' : totalVerses <= 12 ? 'gap-4' : 'gap-2';
    const arabicMixedSize = Math.max(16, fontSize * 1.3 * (totalVerses > 15 ? 0.7 : 1));
    const translationSize = Math.max(12, fontSize * 0.8 * (totalVerses > 15 ? 0.7 : 1));

    return (
      <div className={`flex flex-col h-full ${adaptiveGap} py-2`}>
        {allEntries.map(([sId, data]) => (
          <div key={sId} className="flex flex-col gap-2">
            {data.verses[0].verse_number === 1 && (
              <div className="flex flex-col items-center py-2 mb-2 border-b border-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">Sûre</span>
                <h2 className="text-xl font-serif text-primary/70">{data.name}</h2>
              </div>
            )}
            {data.verses.map((v) => (
              <div key={v.id} className="flex flex-col gap-1 group/verse">
                {(viewType === 'meal+kuran' || viewType === 'kuran+meal') && (
                  <div
                    className="text-right font-serif text-foreground opacity-95"
                    style={{ fontSize: `${arabicMixedSize}px`, lineHeight: lineHeight * 1.6, direction: 'rtl' }}
                  >
                    <span
                      className="inline-flex items-center justify-center rounded-full font-sans text-primary/50 border border-primary/20 bg-primary/[0.04] mr-1 align-middle"
                      style={{ fontSize: '0.4em', width: '1.8em', height: '1.8em', lineHeight: 1 }}
                    >{v.verse_number}</span>
                    {v.verse}
                  </div>
                )}
                {(viewType === 'meal' || viewType === 'meal+kuran' || viewType === 'kuran+meal') && (
                  <div
                    className="text-foreground/75 leading-snug border-l-2 border-primary/15 pl-4"
                    style={{ fontSize: `${translationSize}px`, lineHeight: lineHeight * 1.05 }}
                  >
                    {viewType === 'meal' && (
                      <span className="text-primary/30 text-[0.8em] font-bold mr-1">{v.verse_number}.</span>
                    )}
                    {v.translation.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }, [viewType, fontSize, lineHeight]);

  // -------------------------------------------------------------------------
  // Audio state
  // -------------------------------------------------------------------------
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  useEffect(() => {
    setCurrentTime(0); setDuration(0); setProgress(0); setIsPlaying(false);
  }, [language, activeSurahObj?.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const updateProgress = () => {
      if (el.duration && !isNaN(el.duration)) {
        setProgress((el.currentTime / el.duration) * 100);
        setCurrentTime(el.currentTime);
        setDuration(el.duration);
      }
    };
    const handleEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
    const handleLoadedMetadata = () => { if (el.duration && !isNaN(el.duration)) setDuration(el.duration); };
    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    el.addEventListener('timeupdate', updateProgress);
    el.addEventListener('ended', handleEnded);
    return () => {
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      el.removeEventListener('timeupdate', updateProgress);
      el.removeEventListener('ended', handleEnded);
    };
  }, [activeSurahObj, language, showAudioPlayer]);

  const handlePlayPauseAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.pause(); else el.play().catch(console.error);
    setIsPlaying(!isPlaying);
  };
  const skipAudio = (amount: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.currentTime + amount, el.duration));
  };
  const changePlaybackRate = () => {
    const el = audioRef.current;
    if (!el) return;
    const newRate = playbackRate >= 2 ? 0.5 : playbackRate + 0.5;
    el.playbackRate = newRate;
    setPlaybackRate(newRate);
  };
  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = (Number(e.target.value) / 100) * el.duration;
    setProgress(Number(e.target.value));
  };
  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    return `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------------------
  // Scroll observer (single page mode)
  // -------------------------------------------------------------------------
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!isSinglePageMode || !scrollContainerRef.current) return;
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const index = Number(entry.target.getAttribute('data-page-index'));
          if (!isNaN(index)) setCurrentPage(prev => prev !== index ? index : prev);
        }
      });
    }, { root: scrollContainerRef.current, threshold: 0.51 });
    const timeout = setTimeout(() => {
      document.querySelectorAll('.scroll-page-container').forEach(el => observerRef.current?.observe(el));
    }, 100);
    return () => { clearTimeout(timeout); observerRef.current?.disconnect(); };
  }, [isSinglePageMode, pages]);

  const handlePageJump = (index: number) => {
    if (isSinglePageMode) {
      setCurrentPage(index);
      const el = document.getElementById(`quran-page-${index}`);
      if (el && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      }
    } else {
      bookRef.current?.pageFlip()?.jumpToPage(index);
    }
  };

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
    const verse = verses.find(
      v => v.surah_id === selectedSurahId && v.verse_number === (parseInt(selectedVerse) || 1)
    );

    if (verse) {
      const pageIndex = pages.findIndex(p => p.number === verse.page);
      if (pageIndex !== -1) {
        handlePageJump(pageIndex);
        navigate(`/surah/${selectedSurahId}/page/${verse.page}`, { replace: true });
        if (!isSinglePageMode) {
          try {
            const pageFlip = bookRef.current?.pageFlip();
            if (pageFlip) {
              const currentPageCount = pageFlip.getPageCount();
              const targetIdx = Math.min(pageIndex, currentPageCount - 1);
              pageFlip.flip(targetIdx);
            }
          } catch (e) { console.error('Flip error:', e); }
        }
      }
      return;
    }

    if (selectedSurahMeta?.page_number) {
      const fallbackPage = selectedSurahMeta.page_number;
      const pageIndex = Math.max(0, fallbackPage - 1);
      handlePageJump(pageIndex);
      navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
    }
  };

  const handleSurahSelectChange = (value: string) => {
    setSelectedSurah(value);

    if (!value) {
      return;
    }

    const selectedSurahId = Number(value);
    const selectedSurahMeta = surahs.find((s) => s.id === selectedSurahId);
    if (selectedSurahMeta?.page_number && !selectedVerse.trim()) {
      const fallbackPage = selectedSurahMeta.page_number;
      const pageIndex = Math.max(0, fallbackPage - 1);
      handlePageJump(pageIndex);
      navigate(`/surah/${selectedSurahId}/page/${fallbackPage}`, { replace: true });
    }
  };

  const onPage = useCallback((e: any) => setCurrentPage(e.data), []);

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin" />
        <p className="text-sm font-medium tracking-widest uppercase opacity-50">{t.loading}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center w-full h-full bg-[#0a0a0a] overflow-hidden relative transition-all duration-500">

      {/* Top Floating Navigation */}
      <AnimatePresence>
        {!isNavOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-6 left-6 z-[70]"
          >
            <button
              onClick={() => setIsNavOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white shadow-2xl transition-all duration-300"
              title="Arama ve Navigasyon"
            >
              <Search className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="absolute top-6 left-6 z-[70] bg-[#111] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-center shadow-2xl"
          >
            <button onClick={() => setIsNavOpen(false)} className="p-1 -ml-2 mr-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              className="bg-transparent border-none px-2 py-1.5 text-sm font-medium text-white/90 hover:text-white focus:outline-none focus:ring-0 [&>option]:bg-zinc-900 cursor-pointer appearance-none outline-none"
              value={selectedSurah}
              onChange={(e) => handleSurahSelectChange(e.target.value)}
            >
              <option value="">{t.surahSelect || 'Sure Seç'}</option>
              {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
            </select>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <input
              type="number"
              placeholder={t.verseSelect || 'Ayet'}
              className="bg-transparent border-none px-2 py-1.5 text-sm font-medium text-white/90 focus:outline-none w-16 text-center placeholder:text-white/30"
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              min={1}
            />
            <button onClick={handleSearch} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-1">
              <Search className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-3" />
            <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-1 py-1 flex items-center justify-center min-w-[2.5rem]">
              <span className="text-white/90 text-sm font-bold font-mono">{pages[currentPage]?.number || 0}</span>
            </div>
            <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 w-full flex items-center justify-center overflow-hidden"
      >
        <div
          className="relative flex items-center justify-center transition-transform duration-300 origin-center"
          style={{ transform: `scale(${viewportScale * zoomLevel})` }}
        >
          {isSinglePageMode ? (
            <div
              className="overflow-y-auto overflow-x-hidden flex flex-col items-center gap-6 py-6"
              ref={scrollContainerRef}
              style={{
                width: bookDimensions.width,
                height: `calc(100vh / ${viewportScale})`,
                maxHeight: `calc(100vh / ${viewportScale})`,
              }}
            >
              {pages.map((p, index) => {
                const totalVerses = Object.values(p.versesBySurah).reduce((acc, d) => acc + d.verses.length, 0);
                return (
                  <div
                    key={index}
                    id={`quran-page-${index}`}
                    data-page-index={index}
                    className="scroll-page-container relative shadow-xl bg-[#fdfbf7] flex-shrink-0 rounded-sm"
                    style={{ width: bookDimensions.width, height: bookDimensions.height }}
                  >
                    <Page number={p.number} total={pages.length} isLeft={p.isLeft} isMobile={isMobile}>
                      {renderPageContent(p, totalVerses)}
                    </Page>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/10 z-50 -translate-x-1/2 pointer-events-none" />
              <HTMLPageFlip
                key="double"
                ref={bookRef}
                width={bookDimensions.width}
                height={bookDimensions.height}
                size="fixed"
                minWidth={300}
                maxWidth={3000}
                minHeight={400}
                maxHeight={3000}
                maxShadowOpacity={0.4}
                showCover={true}
                mobileScrollSupport={true}
                usePortrait={false}
                flippingTime={750}
                startPage={currentPage}
                drawShadow={true}
                startZIndex={0}
                autoSize={false}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={false}
                disableFlipByClick={false}
                onFlip={onPage}
                className="quran-flipbook"
                style={{ backgroundColor: '#fdfbf7' }}
              >
                {pages.map((p) => {
                  const totalVerses = Object.values(p.versesBySurah).reduce((acc, d) => acc + d.verses.length, 0);
                  return (
                    <Page key={p.number} number={p.number} total={pages.length} isLeft={p.isLeft} isMobile={false}>
                      {renderPageContent(p, totalVerses)}
                    </Page>
                  );
                })}
              </HTMLPageFlip>
            </>
          )}
        </div>
      </motion.div>

      {/* Audio Player */}
      <AnimatePresence>
        {showAudioPlayer && activeSurahObj && (
          <motion.div
            initial={{ y: 20, opacity: 0, height: 0 }}
            animate={{ y: 0, opacity: 1, height: 48 }}
            exit={{ y: 20, opacity: 0, height: 0 }}
            className="w-full bg-[#333] flex items-center justify-center px-4 z-[75] border-b border-black/20 shrink-0"
          >
            <div className="flex items-center gap-6 text-white/90">
              <button onClick={changePlaybackRate} className="text-xs font-bold w-12 text-center hover:text-white transition-colors">
                {playbackRate.toFixed(1)}x
              </button>
              <button onClick={() => skipAudio(-10)} className="hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
              <button onClick={handlePlayPauseAudio} className="p-1.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors">
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button onClick={() => skipAudio(10)} className="hover:text-white transition-colors"><RotateCw className="w-4 h-4" /></button>
              <div className="w-48 mx-4 relative h-1.5 bg-black/40 rounded-full overflow-hidden cursor-pointer hidden sm:flex items-center">
                <input type="range" min="0" max="100" value={progress} onChange={handleAudioSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <motion.div className="absolute top-0 left-0 h-full bg-white/80" animate={{ width: `${progress}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.1 }} />
              </div>
              <div className="text-[10px] font-mono font-medium text-white/50 min-w-[60px] hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="text-xs font-bold uppercase w-12 text-center text-white/50">
                {language === 'en' ? 'EN' : 'TR'}
              </div>
            </div>
            <audio ref={audioRef} src={language === 'tr' ? activeSurahObj.audio.mp3 : activeSurahObj.audio.mp3_en} preload="none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="w-full h-12 bg-[#2b2b2b] flex items-center px-4 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex items-center text-xs font-semibold text-white/90 min-w-[140px]">
          Page {pages[currentPage]?.number || 0}
          <span className="text-white/60 font-normal ml-1 hidden sm:inline">(Index: {currentPage + 1}/{pages.length})</span>
        </div>
        <div className="flex-1 mx-4 relative h-1.5 bg-black/40 rounded-full overflow-hidden group/slider cursor-pointer flex items-center">
          <input
            type="range"
            min="0"
            max={Math.max(0, pages.length - 1)}
            value={currentPage}
            onChange={(e) => handlePageJump(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/80"
            animate={{ width: `${(currentPage / Math.max(1, pages.length - 1)) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={() => handlePageJump(Math.max(0, currentPage - 1))} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <Play className="w-4 h-4 rotate-180 fill-current" />
          </button>
          <button onClick={() => handlePageJump(Math.min(pages.length - 1, currentPage + 1))} className="p-1.5 text-white/70 hover:text-white transition-colors">
            <Play className="w-4 h-4 fill-current" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={() => setIsSinglePageOverride(true)} className={`p-1.5 transition-colors ${isSinglePageMode ? 'text-white' : 'text-white/50 hover:text-white/80'}`} title="Dikey Kaydırma">
            <FileText className="w-4 h-4" />
          </button>
          <button onClick={() => setIsSinglePageOverride(false)} className={`p-1.5 transition-colors ${!isSinglePageMode ? 'text-white' : 'text-white/50 hover:text-white/80'}`} title="Kitap Modu">
            <BookOpen className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-white/50 hover:text-white/80 transition-colors" onClick={() => alert("Küçük resim görünümü yakında.")}><LayoutGrid className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={() => setShowAudioPlayer(!showAudioPlayer)} className={`p-1.5 transition-colors ${showAudioPlayer ? 'text-white bg-white/10 rounded-sm' : 'text-white/70 hover:text-white'}`}><Headphones className="w-4 h-4" /></button>
          <button onClick={handleZoomOut} className="p-1.5 text-white/70 hover:text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={handleZoomIn} className="p-1.5 text-white/70 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors ml-1">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}