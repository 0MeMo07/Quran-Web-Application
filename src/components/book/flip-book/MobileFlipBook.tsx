import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, BookOpen,
  Headphones, Pause, Settings, Maximize2, Minimize2,
  X, ChevronsLeft, ChevronsRight, AlignJustify,
  Play, SkipBack, SkipForward,
} from 'lucide-react';
import { cn } from '../../ui/cn';
import { FlipBookPage } from './FlipBookPage';
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
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isScrubberVisible: boolean;
  setIsScrubberVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean | ((prev: boolean) => boolean)) => void;
  handleAudioToggle: () => void;
  isPlaying: boolean;
  currentAudioId: number | null;
  currentSurahOnPage: any;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating top button  (same style as original)
// ─────────────────────────────────────────────────────────────────────────────

function FloatingButton({
  onClick, children, className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav Sheet  — original style, slightly cleaned
// ─────────────────────────────────────────────────────────────────────────────

function NavSheet({
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
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1190] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
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
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/15" />
            </div>

            <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
              {/* Header */}
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

              {/* Surah + Verse row */}
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

              {/* Page stepper */}
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio Panel  — slides up from bottom bar on headphone tap
// ─────────────────────────────────────────────────────────────────────────────

function AudioPanel({
  open, onClose, isPlaying, handleAudioToggle,
  currentSurahOnPage, currentPage, pages, bottomOffset,
}: {
  open: boolean;
  onClose: () => void;
  isPlaying: boolean;
  handleAudioToggle: () => void;
  currentSurahOnPage: any;
  currentPage: number;
  pages: any[];
  bottomOffset: string;
}) {
  // Mock progress — replace with real values from your audio context
  const progress = 34; // percent 0-100
  const elapsed = '2:14';
  const remaining = '-4:32';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Panel */}
          <motion.div
            key="audio-panel"
            initial={{ y: '100%', opacity: 0, bottom: bottomOffset }}
            animate={{ y: 0, opacity: 1, bottom: bottomOffset }}
            exit={{ y: '100%', opacity: 0, bottom: bottomOffset }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{ bottom: bottomOffset }}
            className={cn(
              'absolute inset-x-0 z-[1150]',
              'bg-card border border-border shadow-[0_-8px_40px_rgba(0,0,0,0.12)]',
              'rounded-3xl mx-3 mb-2 overflow-hidden',
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 rounded-full bg-foreground/15" />
            </div>

            <div className="px-5 pb-5 pt-2 flex flex-col gap-4">
              {/* Surah label */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.12em] uppercase text-foreground/30 font-medium">
                    Dinleniyor
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                    {currentSurahOnPage?.name ?? 'Sure'}
                    <span className="text-foreground/35 font-normal ml-1.5 text-xs">
                      · Sayfa {pages[currentPage]?.number}
                    </span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground/25 hover:text-foreground/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress track — matches image style */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-foreground/30 tabular-nums w-8 text-right">
                  {elapsed}
                </span>

                {/* Track */}
                <div className="relative flex-1 h-5 flex items-center">
                  {/* BG */}
                  <div className="absolute inset-x-0 h-px bg-foreground/12 rounded-full" />
                  {/* Fill */}
                  <div
                    className="absolute left-0 h-px bg-foreground/50 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Thumb — same as image: small filled circle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-sm pointer-events-none"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  />
                  {/* Hidden range */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={progress}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>

                <span className="text-[10px] text-foreground/30 tabular-nums w-8">
                  {remaining}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button className="p-2 text-foreground/35 hover:text-foreground/60 transition-colors active:scale-90">
                  <SkipBack className="w-5 h-5" />
                </button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleAudioToggle}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'bg-foreground text-background',
                    'shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
                    'transition-opacity active:opacity-70',
                  )}
                >
                  {isPlaying
                    ? <Pause className="w-5 h-5 fill-current" />
                    : <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  }
                </motion.button>

                <button className="p-2 text-foreground/35 hover:text-foreground/60 transition-colors active:scale-90">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scrubber row  (original style kept)
// ─────────────────────────────────────────────────────────────────────────────

function ScrubberRow({
  currentPage, pages, handlePageJump,
}: {
  currentPage: number;
  pages: any[];
  handlePageJump: (i: number) => void;
}) {
  const pct = pages.length > 1 ? (currentPage / (pages.length - 1)) * 100 : 0;

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
        onClick={() => handlePageJump(Math.max(0, currentPage - 1))}
        className="p-1.5 text-foreground/40 active:text-foreground transition-colors"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      <div className="relative flex-1 h-12 flex items-center">
        {/* BG */}
        <div className="absolute inset-x-0 h-px bg-foreground/10 rounded-full" />
        {/* Fill */}
        <div
          className="absolute left-0 h-px bg-foreground/40 rounded-full"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(0, pages.length - 1)}
          value={currentPage}
          onChange={(e) => handlePageJump(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <button
        onClick={() => handlePageJump(Math.min(pages.length - 1, currentPage + 1))}
        className="p-1.5 text-foreground/40 active:text-foreground transition-colors"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom bar button
// ─────────────────────────────────────────────────────────────────────────────

function BarBtn({
  onClick, children, active = false, accent = false, title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  title?: string;
}) {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileFlipBook — root
// ─────────────────────────────────────────────────────────────────────────────

export function MobileFlipBook(props: MobileFlipBookProps) {
  const {
    isNavOpen, setIsNavOpen, onShowSettings,
    selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse,
    handleSearch, handlePageJump,
    currentPage, pages, scrollContainerRef,
    isScrubberVisible, setIsScrubberVisible,
    isSinglePageOverride, setIsSinglePageOverride,
    handleAudioToggle, isPlaying, currentAudioId, currentSurahOnPage,
    toggleFullscreen, isFullscreen,
    t, surahs,
  } = props;

  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);

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
        bottomOffset={isScrubberVisible ? 'calc(108px + env(safe-area-inset-bottom))' : 'calc(56px + env(safe-area-inset-bottom))'}
      />

      {/* ── Scrollable pages ─────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden overscroll-none">
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-auto overflow-x-hidden flex flex-col overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((p, index) => (
            <div
              key={index}
              id={`quran-page-${index}`}
              data-page-index={index}
              className="relative flex-shrink-0"
              style={{ width: '100dvw', height: pageHeight }}
            >
              <FlipBookPage number={p.number} total={pages.length} isLeft={p.isLeft} isMobile>
                {null}
              </FlipBookPage>
            </div>
          ))}
        </div>
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
            />
          )}
        </AnimatePresence>

        {/* Action row */}
        <div className="h-14 px-3 flex items-center justify-between">

          {/* Page info */}
          <div className="flex items-baseline gap-1 min-w-[60px]">
            <span className="text-sm font-semibold text-foreground tabular-nums leading-none">
              {pages[currentPage]?.number ?? '—'}
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
              title="Tek sayfa"
              active={isSinglePageOverride}
              onClick={() => setIsSinglePageOverride((p) => !p)}
            >
              <BookOpen className="w-[17px] h-[17px]" />
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