import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, BookOpen,
  Headphones, Pause, Settings, Maximize2, Minimize2,
  X, AlignJustify, SkipBack, SkipForward, FileText, Play
} from 'lucide-react';
// @ts-ignore
import HTMLPageFlip from 'react-pageflip';
import { cn } from '../../ui/cn';
import { FlipBookPage } from './components/FlipBookPage';
import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from './hooks/useFlipBook';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MobileFlipBookProps {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  onShowSettings: () => void;
  selectedSurah: string;
  handleSurahSelectChange: (val: string) => void;
  selectedVerse: string;
  setSelectedVerse: (val: string) => void;
  handleSearch: () => void;
  handlePageJump: (index: number) => void;
  currentPage: number;
  pages: any[];
  bookRef: React.RefObject<any>;
  onPage: (e: any) => void;
  viewportScale: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isScrubberVisible: boolean;
  setIsScrubberVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean | ((prev: boolean) => boolean)) => void;
  handleAudioToggle: () => void;
  isPlaying: boolean;
  currentAudioId: number | null;
  currentSurahOnPage: any;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating top button
// ─────────────────────────────────────────────────────────────────────────────

const FloatingButton = React.memo(({
  onClick, children, className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-xl',
        'border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        'flex items-center justify-center text-white/80 pointer-events-auto',
        'active:scale-90 transition-transform',
        className,
      )}
    >
      {children}
    </motion.button>
  );
});

const NavSheet = React.memo(({
  open, onClose,
  selectedSurah, handleSurahSelectChange,
  selectedVerse, setSelectedVerse,
  onSearch, currentPage, pages, handlePageJump,
  t, surahs,
}: {
  open: boolean;
  onClose: () => void;
  selectedSurah: string;
  handleSurahSelectChange: (v: string) => void;
  selectedVerse: string;
  setSelectedVerse: (v: string) => void;
  onSearch: () => void;
  currentPage: number;
  pages: any[];
  handlePageJump: (i: number) => void;
  t: any;
  surahs: any[];
}) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1190] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="nav-sheet"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'absolute top-0 inset-x-0 z-[1200]',
              'bg-[#0d0d0d]/95 backdrop-blur-2xl',
              'border-b border-white/[0.07]',
              'shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
              'rounded-b-3xl overflow-hidden',
              'pt-[env(safe-area-inset-top)]',
            )}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/15" />
            </div>

            <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.18em] uppercase text-white/25 select-none">
                  Navigasyon
                </span>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 active:scale-90 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedSurah}
                    onChange={(e) => handleSurahSelectChange(e.target.value)}
                    className={cn(
                      'w-full h-11 rounded-2xl px-4 pr-10 text-sm font-medium text-white',
                      'bg-white/[0.06] border border-white/[0.09]',
                      'focus:outline-none focus:border-white/20',
                      'transition-all appearance-none',
                    )}
                  >
                    <option value="">{t?.surahSelect ?? 'Sure seç'}</option>
                    {surahs.map((s) => (
                      <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 rotate-90 pointer-events-none" />
                </div>

                <input
                  type="number"
                  placeholder={t?.versePlaceholder ?? 'Ayet'}
                  value={selectedVerse}
                  onChange={(e) => setSelectedVerse(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  min={1}
                  className={cn(
                    'w-20 h-11 rounded-2xl px-3 text-sm font-medium text-white text-center',
                    'bg-white/[0.06] border border-white/[0.09]',
                    'focus:outline-none focus:border-white/20',
                    'transition-all [appearance:textfield]',
                    '[&::-webkit-inner-spin-button]:appearance-none',
                  )}
                />

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onSearch}
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                    'bg-white/10 border border-white/[0.09] text-white/70',
                    'active:bg-white/15 transition-all',
                  )}
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] border border-white/[0.06] px-2 h-11">
                <button
                  onClick={() => handlePageJump(Math.max(0, currentPage - 1))}
                  className="p-2 text-white/40 hover:text-white/70 active:scale-90 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-white/90 font-semibold text-sm leading-none tabular-nums">
                    {pages[currentPage]?.number ?? '—'}
                  </span>
                  <span className="text-white/25 text-[10px] mt-0.5">
                    {currentPage + 1} / {pages.length}
                  </span>
                </div>
                <button
                  onClick={() => handlePageJump(Math.min(pages.length - 1, currentPage + 1))}
                  className="p-2 text-white/40 hover:text-white/70 active:scale-90 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const AudioPanel = React.memo(({
  open, onClose, isPlaying, handleAudioToggle,
  currentSurahOnPage, currentPage, pages, bottomOffset,
  currentTime, duration, seek,
}: {
  open: boolean;
  onClose: () => void;
  isPlaying: boolean;
  handleAudioToggle: () => void;
  currentSurahOnPage: any;
  currentPage: number;
  pages: any[];
  bottomOffset: string;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
            key="audio-panel"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '110%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{ bottom: bottomOffset }}
            className={cn(
              'absolute inset-x-0 z-[1150]',
              'bg-transparent backdrop-blur-3xl',
              'rounded-[2.5rem] mx-4 mb-3 overflow-hidden',
            )}
          >
            <div className="flex justify-center pt-2.5 pb-0.5">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 font-black">
                    Sesli Okuma
                  </p>
                  <p className="text-sm font-bold text-card-foreground leading-tight mt-1">
                    {currentSurahOnPage?.name ?? 'Sure'}
                    <span className="text-muted-foreground/40 font-medium ml-2 text-[11px]">
                      · Sayfa {pages[currentPage]?.number}
                    </span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative h-6 flex items-center group">
                  <div className="absolute inset-x-0 h-1.5 bg-muted rounded-full" />
                  <div
                    className="absolute left-0 h-1.5 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg pointer-events-none transition-all duration-300 border-2 border-card"
                    style={{ left: `calc(${progress}% - 8px)` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                  />
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider tabular-nums">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-10">
                <button className="p-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-all active:scale-90">
                  <SkipBack className="w-6 h-6" />
                </button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleAudioToggle}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(var(--color-primary),0.2)]',
                    'active:opacity-80 transition-all',
                  )}
                >
                  {isPlaying
                    ? <Pause className="w-6 h-6 fill-current" />
                    : <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  }
                </motion.button>

                <button className="p-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-all active:scale-90">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
});

const ScrubberRow = React.memo(({
  currentPage, pages, handlePageJump, bookRef, isSinglePageOverride, sliderValue, setSliderValue
}: {
  currentPage: number;
  pages: any[];
  handlePageJump: (i: number) => void;
  bookRef: React.RefObject<any>;
  isSinglePageOverride: boolean;
  sliderValue: number | null;
  setSliderValue: (v: number | null) => void;
}) => {
  const displayValue = sliderValue === null ? currentPage : sliderValue;
  const pct = pages.length > 1 ? (displayValue / (pages.length - 1)) * 100 : 0;

  return (
    <motion.div
      key="scrubber"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 52, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="flex items-center gap-3 px-4 overflow-hidden border-b border-border/40"
    >
      <button
        onClick={() => {
          if (isSinglePageOverride) {
            handlePageJump(Math.max(0, currentPage - 1));
          } else {
            bookRef.current?.pageFlip()?.flipPrev();
          }
        }}
        className="p-1.5 text-foreground/40 active:text-foreground transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative flex-1 h-12 flex items-center">
        <div className="absolute inset-x-0 h-px bg-foreground/10 rounded-full" />
        <div
          className="absolute left-0 h-px bg-foreground/40 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(0, pages.length - 1)}
          value={displayValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          onPointerUp={() => {
            if (sliderValue !== null) {
              handlePageJump(sliderValue);
              setSliderValue(null);
            }
          }}
          onMouseUp={() => {
            if (sliderValue !== null) {
              handlePageJump(sliderValue);
              setSliderValue(null);
            }
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <button
        onClick={() => {
          if (isSinglePageOverride) {
            handlePageJump(Math.min(pages.length - 1, currentPage + 1));
          } else {
            bookRef.current?.pageFlip()?.flipNext();
          }
        }}
        className="p-1.5 text-foreground/40 active:text-foreground transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
});

const BarBtn = React.memo(({
  onClick, children, active = false, accent = false, title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  title?: string;
}) => {
  return (
    <motion.button
      aria-label={title}
      whileTap={{ scale: 0.82 }}
      transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150',
        accent   ? 'text-amber-500'
        : active ? 'text-foreground'
                 : 'text-foreground/35 hover:text-foreground/60',
      )}
    >
      {children}
    </motion.button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MobileFlipBook — root
// ─────────────────────────────────────────────────────────────────────────────

export function MobileFlipBook(props: MobileFlipBookProps) {
  const {
    isNavOpen, setIsNavOpen, onShowSettings,
    selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse,
    handleSearch, handlePageJump,
    currentPage, pages, bookRef, onPage,
    viewportScale, scrollContainerRef,
    isScrubberVisible, setIsScrubberVisible,
    isSinglePageOverride, setIsSinglePageOverride,
    handleAudioToggle, isPlaying, currentAudioId, currentSurahOnPage,
    currentTime, duration, seek,
    toggleFullscreen, isFullscreen,
    t, surahs,
  } = props;

  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [sliderValue, setSliderValue] = React.useState<number | null>(null);

  const pageHeight =
    typeof window !== 'undefined'
      ? (window.innerWidth * LOGICAL_PAGE_HEIGHT) / LOGICAL_PAGE_WIDTH
      : 560;

  const isAudioActive = isPlaying && currentAudioId === currentSurahOnPage?.id;

  const onSearch = useCallback(() => {
    handleSearch();
    setIsNavOpen(false);
  }, [handleSearch, setIsNavOpen]);

  const onHeadphonePress = useCallback(() => {
    setIsAudioPanelOpen((p) => !p);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col w-[100dvw] h-[100dvh] bg-background overflow-hidden overscroll-none">

      {/* ── Top floating buttons ──────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[1100] flex justify-between items-center px-4 pt-[calc(env(safe-area-inset-top)+12px)] pointer-events-none">
        <FloatingButton onClick={() => setIsNavOpen(true)}>
          <Search className="w-[18px] h-[18px]" />
        </FloatingButton>
        <FloatingButton onClick={onShowSettings}>
          <Settings className="w-[18px] h-[18px]" />
        </FloatingButton>
      </div>

      {/* ── Nav sheet ────────────────────────────────────────────────────── */}
      <NavSheet
        open={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        selectedSurah={selectedSurah}
        handleSurahSelectChange={handleSurahSelectChange}
        selectedVerse={selectedVerse}
        setSelectedVerse={setSelectedVerse}
        onSearch={onSearch}
        currentPage={currentPage}
        pages={pages}
        handlePageJump={handlePageJump}
        t={t}
        surahs={surahs}
      />

      {/* ── Audio panel ───────────────────────────────────────────────────── */}
      <AudioPanel
        open={isAudioPanelOpen}
        onClose={() => setIsAudioPanelOpen(false)}
        isPlaying={isPlaying}
        handleAudioToggle={handleAudioToggle}
        currentSurahOnPage={currentSurahOnPage}
        currentPage={currentPage}
        pages={pages}
        currentTime={currentTime}
        duration={duration}
        seek={seek}
        bottomOffset={isScrubberVisible ? 'calc(108px + env(safe-area-inset-bottom))' : 'calc(56px + env(safe-area-inset-bottom))'}
      />

      {/* ── Pages Area ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden overscroll-none bg-background flex items-center justify-center">
        {isSinglePageOverride ? (
          <div
            ref={scrollContainerRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollTop / pageHeight);
              if (idx !== currentPage && idx >= 0 && idx < pages.length) {
                onPage({ data: idx });
              }
            }}
            className="h-full w-full overflow-y-auto overflow-x-hidden flex flex-col overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center"
          >
            {pages.map((p, index) => {
              // Virtualization: only render pages within a small range
              const isVisible = Math.abs(index - currentPage) <= 3;
              
              return (
                <div
                  key={index}
                  id={`quran-page-${index}`}
                  data-page-index={index}
                  className="relative flex-shrink-0"
                  style={{ width: '100dvw', height: pageHeight }}
                >
                  {isVisible ? (
                    <FlipBookPage 
                      number={p.number} 
                      total={pages.length} 
                      isLeft={p.isLeft} 
                      isMobile={true}
                      isSinglePage={true}
                    >
                      {null}
                    </FlipBookPage>
                  ) : (
                    // Light placeholder with the same visual style
                    <div className="w-full h-full bg-[#fdfbf7] border-b border-black/[0.03]" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: viewportScale,
              x: (currentPage === 0 ? -LOGICAL_PAGE_WIDTH / 2 : (currentPage === pages.length - 1 ? LOGICAL_PAGE_WIDTH / 2 : 0)) * viewportScale
            }}
            className="relative flex items-center justify-center origin-center will-change-transform"
            style={{ backfaceVisibility: 'hidden', touchAction: 'none' }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-[4px] z-0 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-black/20 via-black/5 to-black/20 opacity-60" />
            <HTMLPageFlip
              key="double-mobile"
              ref={bookRef}
              width={LOGICAL_PAGE_WIDTH}
              height={LOGICAL_PAGE_HEIGHT}
              size="fixed"
              minWidth={300}
              maxWidth={3000}
              minHeight={400}
              maxHeight={3000}
              maxShadowOpacity={0.2}
              showCover={true}
              mobileScrollSupport={true}
              usePortrait={false}
              flippingTime={600}
              startPage={currentPage}
              drawShadow={true}
              startZIndex={1}
              autoSize={false}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={false}
              disableFlipByClick={false}
              onFlip={onPage}
              className="quran-flipbook"
              style={{ backgroundColor: 'transparent' }}
            >
              {pages.map((p, idx) => (
                <div 
                  key={p.number} 
                  className="page-wrapper" 
                  style={{ 
                    width: LOGICAL_PAGE_WIDTH, 
                    height: LOGICAL_PAGE_HEIGHT,
                    borderRadius: p.isLeft ? '6px 0 0 6px' : '0 6px 6px 0',
                    overflow: 'hidden',
                    pointerEvents: 'auto'
                  }}
                >
                  <FlipBookPage 
                    number={p.number} 
                    total={pages.length} 
                    isLeft={p.isLeft} 
                    isMobile={false}
                    isSinglePage={false}
                  >
                    {null}
                  </FlipBookPage>
                </div>
              ))}
            </HTMLPageFlip>
          </motion.div>
        )}
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="w-full z-[1100] flex flex-col bg-card border-t border-border pb-[env(safe-area-inset-bottom)] transition-colors duration-200">

        {/* Scrubber (collapsible) */}
        <AnimatePresence>
          {isScrubberVisible && (
            <ScrubberRow
              currentPage={currentPage}
              pages={pages}
              handlePageJump={handlePageJump}
              bookRef={bookRef}
              isSinglePageOverride={isSinglePageOverride}
              sliderValue={sliderValue}
              setSliderValue={setSliderValue}
            />
          )}
        </AnimatePresence>

        {/* Action row */}
        <div className="h-14 px-3 flex items-center justify-between">

          {/* Page info */}
          <div className="flex items-baseline gap-1 min-w-[60px]">
            <span className="text-sm font-semibold text-foreground tabular-nums leading-none">
              {pages[sliderValue === null ? currentPage : sliderValue]?.number ?? '—'}
            </span>
            <span className="text-[11px] text-foreground/30 leading-none">
              / {pages.length}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center">
            <BarBtn
              title="Scrubber"
              active={isScrubberVisible}
              onClick={() => setIsScrubberVisible((p) => !p)}
            >
              <AlignJustify className="w-[17px] h-[17px]" />
            </BarBtn>

            <BarBtn
              title={isSinglePageOverride ? "Kitap Modu" : "Tek Sayfa Modu"}
              active={!isSinglePageOverride}
              onClick={() => setIsSinglePageOverride((p) => !p)}
            >
              {isSinglePageOverride ? (
                <BookOpen className="w-[17px] h-[17px]" />
              ) : (
                <FileText className="w-[17px] h-[17px]" />
              )}
            </BarBtn>

            {/* hairline separator */}
            <div className="w-px h-4 bg-border mx-1 flex-shrink-0" />

            {/* Headphone — opens audio panel */}
            <BarBtn
              title="Ses"
              accent={isAudioActive}
              active={isAudioPanelOpen}
              onClick={onHeadphonePress}
            >
              {isAudioActive
                ? <Pause className="w-[17px] h-[17px]" />
                : <Headphones className="w-[17px] h-[17px]" />
              }
            </BarBtn>

            <BarBtn
              title={isFullscreen ? 'Küçült' : 'Tam ekran'}
              onClick={toggleFullscreen}
            >
              {isFullscreen
                ? <Minimize2 className="w-[17px] h-[17px]" />
                : <Maximize2 className="w-[17px] h-[17px]" />
              }
            </BarBtn>
          </div>
        </div>
      </div>
    </div>
  );
}