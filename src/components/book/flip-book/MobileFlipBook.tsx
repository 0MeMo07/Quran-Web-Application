import React, { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, BookOpen,
  Pause, Settings, Maximize2, Minimize2,
  AlignJustify, FileText, Headphones,
  UserRound, ZoomIn, ZoomOut
} from 'lucide-react';

import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from './hooks/useFlipBook';
import { FlippingMode, ViewType } from '../../../store/slices/uiSlice';
import { selectSearchLanguage } from '../../../store/slices/searchSlice';
import { setLanguage as setSearchLanguage } from '../../../store/slices/uiSlice';
import { selectAuthors, selectSelectedAuthor, setSelectedAuthor } from '../../../store/slices/translationsSlice';
import type { AppDispatch } from '../../../store/store';
import type { MushafPageLayout } from './hooks/mushafPagination';

// Newly extracted components
import { MobileAuthorSheet } from './components/MobileAuthorSheet';
import { MobileNavSheet } from './components/MobileNavSheet';
import { MobileAudioPanel } from './components/MobileAudioPanel';
import { MobileScrubberRow } from './components/MobileScrubberRow';
import { FloatingButton, BarBtn } from './components/MobileButtons';
import { MobilePagesArea } from './components/MobilePagesArea';

interface MobileFlipBookProps {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  onShowSettings: () => void;
  selectedSurah: string;
  handleSurahSelectChange: (val: string) => void;
  selectedVerse: string;
  setSelectedVerse: (val: string) => void;
  showAuthorNotes: boolean;
  setShowAuthorNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleSearch: () => void;
  handlePageJump: (index: number) => void;
  currentPage: number;
  pages: any[];
  bookRef: React.RefObject<any>;
  onPage: (e: any) => void;
  viewportScale: number;
  dragMarginX: number;
  dragMarginY: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isScrubberVisible: boolean;
  setIsScrubberVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean | ((prev: boolean) => boolean)) => void;
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleAudioToggle: () => void;
  isPlaying: boolean;
  currentAudioId: number | null;
  currentSurahOnPage: any;
  pageLayoutsByNumber: Map<number, MushafPageLayout>;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
  viewType: ViewType;
  flippingMode: FlippingMode;
}


export function MobileFlipBook(props: MobileFlipBookProps) {
  const {
    isNavOpen, setIsNavOpen, onShowSettings,
    selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse,
    showAuthorNotes, setShowAuthorNotes,
    handleSearch, handlePageJump,
    currentPage, pages, bookRef, onPage,
    viewportScale, dragMarginX, dragMarginY, scrollContainerRef,
    isScrubberVisible, setIsScrubberVisible,
    isSinglePageOverride, setIsSinglePageOverride,
    zoomLevel, handleZoomIn, handleZoomOut,
    handleAudioToggle, isPlaying, currentAudioId, currentSurahOnPage, pageLayoutsByNumber,
    currentTime, duration, seek,
    toggleFullscreen, isFullscreen,
    t, surahs, viewType, flippingMode,
  } = props;

  const dispatch = useDispatch<AppDispatch>();
  const language = useSelector(selectSearchLanguage);
  const authors = useSelector(selectAuthors);
  const selectedAuthor = useSelector(selectSelectedAuthor);

  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [isAuthorSheetOpen, setIsAuthorSheetOpen] = useState(false);
  const [sliderValue, setSliderValue] = React.useState<number | null>(null);

  const pageHeight =
    typeof window !== 'undefined'
      ? (window.innerWidth * LOGICAL_PAGE_HEIGHT) / LOGICAL_PAGE_WIDTH
      : 560;
  const singlePageScale = pageHeight / LOGICAL_PAGE_HEIGHT;
  const effectiveSinglePageScale = singlePageScale * zoomLevel;
  const singlePageItemHeight = pageHeight * zoomLevel;
  const singlePageViewportWidth = `${Math.max(1, zoomLevel) * 100}dvw`;

  const isAudioActive = isPlaying && currentAudioId === currentSurahOnPage?.id;

  const filteredAuthors = React.useMemo(() => {
    const normalizedLanguage = (language || '').toLowerCase();
    const languageMatchedAuthors = authors.filter((author) =>
      author.language?.toLowerCase().startsWith(normalizedLanguage),
    );

    return languageMatchedAuthors.length > 0 ? languageMatchedAuthors : authors;
  }, [authors, language]);

  const onAuthorLanguageChange = useCallback((nextLanguage: 'tr' | 'en') => {
    dispatch(setSearchLanguage(nextLanguage));
  }, [dispatch]);

  const onAuthorSelect = useCallback((authorId: number | null) => {
    const author = authorId === null
      ? null
      : authors.find((item) => item.id === authorId) ?? null;

    dispatch(setSelectedAuthor(author));
    setIsAuthorSheetOpen(false);
  }, [authors, dispatch]);

  const onSearch = useCallback(() => {
    handleSearch();
    setIsNavOpen(false);
  }, [handleSearch, setIsNavOpen]);

  const onHeadphonePress = useCallback(() => {
    setIsAuthorSheetOpen(false);
    setIsAudioPanelOpen((p) => !p);
  }, []);

  const onAuthorPress = useCallback(() => {
    setIsAudioPanelOpen(false);
    setIsAuthorSheetOpen((p) => !p);
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
      <MobileNavSheet
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
      <MobileAudioPanel
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

      <MobileAuthorSheet
        open={isAuthorSheetOpen}
        onClose={() => setIsAuthorSheetOpen(false)}
        language={language}
        onLanguageChange={onAuthorLanguageChange}
        filteredAuthors={filteredAuthors}
        selectedAuthorId={selectedAuthor?.id ?? null}
        onAuthorSelect={onAuthorSelect}
        showAuthorNotes={showAuthorNotes}
        setShowAuthorNotes={setShowAuthorNotes}
        t={t}
      />

      {/* ── Pages Area ───────────────────────────────────────────────────── */}
      <MobilePagesArea
        isSinglePageOverride={isSinglePageOverride}
        scrollContainerRef={scrollContainerRef}
        singlePageItemHeight={singlePageItemHeight}
        currentPage={currentPage}
        pages={pages}
        onPage={onPage}
        singlePageViewportWidth={singlePageViewportWidth}
        effectiveSinglePageScale={effectiveSinglePageScale}
        viewType={viewType}
        pageLayoutsByNumber={pageLayoutsByNumber}
        zoomLevel={zoomLevel}
        viewportScale={viewportScale}
        dragMarginX={dragMarginX}
        dragMarginY={dragMarginY}
        bookRef={bookRef}
        flippingMode={flippingMode}
      />

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="w-full z-[1100] flex flex-col bg-card border-t border-border pb-[env(safe-area-inset-bottom)] transition-colors duration-200">

        {/* Scrubber (collapsible) */}
        <AnimatePresence>
          {isScrubberVisible && (
            <MobileScrubberRow
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
              {isAudioActive ? (
                <Pause className="w-[17px] h-[17px]" />
              ) : (
                <Headphones className="w-[17px] h-[17px]" />
              )}
            </BarBtn>

            <BarBtn
              title={t.sidebar?.selectTranslator || 'Cevirmen Sec'}
              active={isAuthorSheetOpen}
              onClick={onAuthorPress}
            >
              <UserRound className="w-[17px] h-[17px]" />
            </BarBtn>

            {!isSinglePageOverride && (
              <>
                <BarBtn
                  title="Uzaklastir"
                  onClick={handleZoomOut}
                  active={zoomLevel > 1}
                >
                  <ZoomOut className="w-[17px] h-[17px]" />
                </BarBtn>

                <BarBtn
                  title="Yakinlastir"
                  onClick={handleZoomIn}
                  active={zoomLevel > 1}
                >
                  <ZoomIn className="w-[17px] h-[17px]" />
                </BarBtn>
              </>
            )}

            <BarBtn
              title={isFullscreen ? 'Küçült' : 'Tam ekran'}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="w-[17px] h-[17px]" />
              ) : (
                <Maximize2 className="w-[17px] h-[17px]" />
              )}
            </BarBtn>
          </div>
        </div>
      </div>
    </div>
  );
}