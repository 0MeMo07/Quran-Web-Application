import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import HTMLPageFlip from 'react-pageflip';
import { useDispatch, useSelector } from 'react-redux';
import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from './hooks/useFlipBook';
import { FlippingMode, ViewType } from '../../../store/slices/uiSlice';
import { selectSearchLanguage } from '../../../store/slices/searchSlice';
import { setLanguage as setSearchLanguage } from '../../../store/slices/uiSlice';
import { selectAuthors, selectSelectedAuthor, setSelectedAuthor } from '../../../store/slices/translationsSlice';
import type { AppDispatch } from '../../../store/store';
import type { MushafPageLayout } from './hooks/mushafPagination';

// Sub-components
import { FlipBookPage } from './components/FlipBookPage';
import { AudioPanel } from './components/AudioPanel';
import { PageStack } from './components/PageStack';

// Newly extracted components
import { DesktopNav } from './components/DesktopNav';
import { DesktopAuthorPanel } from './components/DesktopAuthorPanel';
import { DesktopBottomBar } from './components/DesktopBottomBar';

interface DesktopFlipBookProps {
  onShowSettings: () => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  selectedSurah: string;
  handleSurahSelectChange: (val: string) => void;
  selectedVerse: string;
  setSelectedVerse: (val: string) => void;
  showAuthorNotes: boolean;
  setShowAuthorNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleSearch: () => void;
  bookRef: React.RefObject<any>;
  pages: any[];
  currentPage: number;
  zoomLevel: number;
  viewportScale: number;
  dragMarginX: number;
  dragMarginY: number;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean | ((prev: boolean) => boolean)) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onPage: (e: any) => void;
  handlePageJump: (index: number) => void;
  handleAudioToggle: () => void;
  isPlaying: boolean;
  currentAudioId: number | null;
  currentSurahOnPage: any;
  pageLayoutsByNumber: Map<number, MushafPageLayout>;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
  viewType: ViewType;
  flippingMode: FlippingMode;
}

export const DesktopFlipBook = React.memo(function DesktopFlipBook(props: DesktopFlipBookProps) {
  const {
    onShowSettings, isNavOpen, setIsNavOpen, selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse, showAuthorNotes, setShowAuthorNotes,
    handleSearch, bookRef, pages, currentPage,
    zoomLevel, viewportScale, dragMarginX, dragMarginY, isSinglePageOverride,
    setIsSinglePageOverride, scrollContainerRef, onPage, handlePageJump,
    handleAudioToggle, isPlaying, currentSurahOnPage, pageLayoutsByNumber,
    currentTime, duration, seek,
    handleZoomIn, handleZoomOut, toggleFullscreen, isFullscreen, t, surahs,
    viewType, flippingMode
  } = props;

  const dispatch = useDispatch<AppDispatch>();
  const language = useSelector(selectSearchLanguage);
  const authors = useSelector(selectAuthors);
  const selectedAuthor = useSelector(selectSelectedAuthor);

  const [isAudioPanelVisible, setIsAudioPanelVisible] = React.useState(false);
  const [isAuthorPanelVisible, setIsAuthorPanelVisible] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState<number | null>(null);

  const lastActivePageRef = React.useRef(currentPage);
  const scrollTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    lastActivePageRef.current = currentPage;
  }, [currentPage]);

  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const selectedSurahMeta = React.useMemo(
    () => surahs.find((surah) => surah.id === Number(selectedSurah)),
    [surahs, selectedSurah],
  );

  const availableVerses = React.useMemo(() => {
    const totalVerseCount = Number(selectedSurahMeta?.verse_count ?? 0);
    if (!selectedSurahMeta || totalVerseCount <= 0) {
      return [] as number[];
    }

    return Array.from({ length: totalVerseCount }, (_, index) => index + 1);
  }, [selectedSurahMeta]);

  const filteredAuthors = React.useMemo(() => {
    const normalizedLanguage = (language || '').toLowerCase();
    const languageMatchedAuthors = authors.filter((author) =>
      author.language?.toLowerCase().startsWith(normalizedLanguage),
    );

    return languageMatchedAuthors.length > 0 ? languageMatchedAuthors : authors;
  }, [authors, language]);

  const handleAuthorSelect = React.useCallback((authorId: number | null) => {
    const author = authorId === null
      ? null
      : authors.find((item) => item.id === authorId) ?? null;

    dispatch(setSelectedAuthor(author));
    setIsAuthorPanelVisible(false);
  }, [authors, dispatch]);

  const handleAuthorLanguageChange = React.useCallback((nextLanguage: 'tr' | 'en') => {
    dispatch(setSearchLanguage(nextLanguage));
  }, [dispatch]);

  // Sync panel visibility with initial play
  React.useEffect(() => {
    if (isPlaying && !isAudioPanelVisible) {
      setIsAudioPanelVisible(true);
    }
  }, [isPlaying]);

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seek(newTime);
  };

  const handleSkipRef = React.useRef(handleSkip);
  const handleAudioToggleRef = React.useRef(handleAudioToggle);

  React.useEffect(() => {
    handleSkipRef.current = handleSkip;
    handleAudioToggleRef.current = handleAudioToggle;
  }, [handleSkip, handleAudioToggle]);

  // Centralized keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAudioPanelVisible) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          handleSkipRef.current(-5);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          handleSkipRef.current(5);
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleAudioToggleRef.current();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isAudioPanelVisible]);

  const toggleAudioPanelVisibility = () => {
    setIsAudioPanelVisible(!isAudioPanelVisible);
  };

  return (
    <div className="flex flex-col justify-between items-center w-full h-full bg-background overflow-hidden relative transition-all duration-500">
      {/* Top Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-6 right-6 z-[70]"
      >
        <button
          onClick={onShowSettings}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-card-foreground hover:bg-accent shadow-xl transition-all duration-300"
          title="Yazı Ayarları"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      <AnimatePresence>
        <DesktopNav
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          selectedSurah={selectedSurah}
          handleSurahSelectChange={handleSurahSelectChange}
          selectedVerse={selectedVerse}
          setSelectedVerse={setSelectedVerse}
          availableVerses={availableVerses}
          handleSearch={handleSearch}
          bookRef={bookRef}
          pages={pages}
          currentPage={currentPage}
          t={t}
          surahs={surahs}
          selectedSurahMeta={selectedSurahMeta}
        />
      </AnimatePresence>

      <AnimatePresence>
        {isAudioPanelVisible && currentSurahOnPage && (
          <AudioPanel
            isPlaying={isPlaying}
            currentSurahOnPage={currentSurahOnPage}
            currentTime={currentTime}
            duration={duration}
            seek={seek}
            handleAudioToggle={handleAudioToggle}
            pages={pages}
            currentPage={currentPage}
            onClose={() => setIsAudioPanelVisible(false)}
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 w-full flex items-center justify-center overflow-hidden"
      >
        <motion.div
          drag={zoomLevel > 1}
          dragConstraints={{ 
            left: -dragMarginX, 
            right: dragMarginX, 
            top: -dragMarginY, 
            bottom: dragMarginY 
          }}
          dragElastic={0.05}
          dragMomentum={true}
          dragTransition={{ power: 0.1, timeConstant: 200 }}
          animate={{ 
            scale: viewportScale * zoomLevel,
            x: zoomLevel <= 1.01 
              ? (isSinglePageOverride ? 0 : (currentPage === 0 ? -LOGICAL_PAGE_WIDTH / 2 : (currentPage === pages.length - 1 ? LOGICAL_PAGE_WIDTH / 2 : 0)))
              : undefined,
            y: zoomLevel <= 1.01 ? 0 : undefined
          }}
          transition={{ type: 'spring', damping: 35, stiffness: 80 }}
          className={`relative flex items-center justify-center origin-center will-change-transform min-w-fit ${
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          style={{ backfaceVisibility: 'hidden', touchAction: 'none' }}
        >
          {isSinglePageOverride ? (
            <div
              className="overflow-y-auto overflow-x-hidden flex flex-col items-center gap-6 py-6 scrollbar-hidden"
              ref={scrollContainerRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (scrollTimeoutRef.current !== null) return;

                scrollTimeoutRef.current = window.setTimeout(() => {
                  scrollTimeoutRef.current = null;
                  const idx = Math.round(el.scrollTop / LOGICAL_PAGE_HEIGHT);
                  if (idx !== lastActivePageRef.current && idx >= 0 && idx < pages.length) {
                    lastActivePageRef.current = idx;
                    onPage({ data: idx });
                  }
                }, 60);
              }}
              style={{
                width: LOGICAL_PAGE_WIDTH,
                height: `calc(100vh / ${viewportScale})`,
                maxHeight: `calc(100vh / ${viewportScale})`,
              }}
            >
                {pages.map((p, index) => {
                  const isVisible = Math.abs(index - currentPage) <= 10;
                  return (
                    <div
                      key={index}
                      id={`quran-page-${index}`}
                      data-page-index={index}
                      className="scroll-page-container relative shadow-xl bg-card flex-shrink-0"
                      style={{ 
                        width: LOGICAL_PAGE_WIDTH, 
                        height: LOGICAL_PAGE_HEIGHT,
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}
                    >
                      {isVisible ? (
                        <FlipBookPage 
                          number={p.number} 
                          total={pages.length} 
                          isLeft={p.isLeft} 
                          isMobile={false}
                          isSinglePage={true}
                          viewType={viewType}
                          coverKind={p.coverKind}
                          pageLayout={pageLayoutsByNumber.get(p.quranPageNumber)}
                        >
                          {null}
                        </FlipBookPage>
                      ) : (
                        <div className="w-full h-full bg-card flex items-center justify-center">
                          <span className="text-black/5 text-xs">{p.number}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="relative" style={{ width: LOGICAL_PAGE_WIDTH * 2, height: LOGICAL_PAGE_HEIGHT }}>
              <div className="absolute left-1/2 top-0 bottom-0 w-[4px] z-0 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15 opacity-50" />
              <HTMLPageFlip
                key={`double-${flippingMode}`}
                ref={bookRef}
                width={LOGICAL_PAGE_WIDTH}
                height={LOGICAL_PAGE_HEIGHT}
                size="fixed"
                minWidth={300}
                maxWidth={3000}
                minHeight={400}
                maxHeight={3000}
                maxShadowOpacity={flippingMode === '3d' ? 0.2 : 0}
                showCover={true}
                mobileScrollSupport={true}
                usePortrait={false}
                flippingTime={flippingMode === '3d' ? 800 : 400}
                startPage={currentPage}
                drawShadow={flippingMode === '3d'}
                startZIndex={20}
                autoSize={false}
                clickEventForward={true}
                useMouseEvents={zoomLevel === 1}
                swipeDistance={zoomLevel === 1 ? 30 : 0}
                showPageCorners={false}
                disableFlipByClick={true}
                onFlip={onPage}
                className="quran-flipbook"
                style={{ backgroundColor: 'transparent', pointerEvents: zoomLevel > 1 ? 'none' : 'auto', zIndex: 10 }}
              >
                {pages.map((p, idx) => {
                  const isVisible = Math.abs(idx - currentPage) <= 10;
                  return (
                      <div 
                        key={idx} 
                        className="page-wrapper" 
                        data-density={flippingMode === 'flat' ? 'hard' : 'soft'} 
                        style={{ 
                          width: LOGICAL_PAGE_WIDTH, 
                          height: LOGICAL_PAGE_HEIGHT,
                          borderRadius: p.isLeft ? '6px 0 0 6px' : '0 6px 6px 0',
                          overflow: 'hidden',
                          pointerEvents: 'auto',
                          cursor: zoomLevel === 1 ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (zoomLevel > 1) return;
                          if (p.isLeft) bookRef.current?.pageFlip()?.flipPrev();
                          else bookRef.current?.pageFlip()?.flipNext();
                        }}
                      >
                        {isVisible ? (
                          <FlipBookPage 
                            number={p.number} 
                            total={pages.length} 
                            isLeft={p.isLeft} 
                            isMobile={false}
                            isSinglePage={false}
                            flippingMode={flippingMode}
                            viewType={viewType}
                            coverKind={p.coverKind}
                            pageLayout={pageLayoutsByNumber.get(p.quranPageNumber)}
                          >
                            {null}
                          </FlipBookPage>
                        ) : (
                        <div className="w-full h-full bg-card flex items-center justify-center border border-border/5 opacity-50">
                          <span className="text-black/5 font-serif text-2xl">{p.number}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </HTMLPageFlip>

              {/* Page Stacks (3D Effect) Always visible */}
              {(true || zoomLevel <= 1.01) && (
                <>
                  {/* Left Stack */}
                  <PageStack 
                    side="left" 
                    count={currentPage} 
                    total={pages.length} 
                    onJump={(pageIndex) => handlePageJump(pageIndex)}
                    currentPage={currentPage}
                  />
                  {/* Right Stack */}
                  <PageStack 
                    side="right" 
                    count={Math.max(0, pages.length - currentPage - 2)} 
                    total={pages.length} 
                    onJump={(pageIndex) => handlePageJump(pageIndex)}
                    currentPage={currentPage}
                  />
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        <DesktopAuthorPanel
          isAuthorPanelVisible={isAuthorPanelVisible}
          setIsAuthorPanelVisible={setIsAuthorPanelVisible}
          language={language}
          filteredAuthors={filteredAuthors}
          selectedAuthor={selectedAuthor}
          showAuthorNotes={showAuthorNotes}
          setShowAuthorNotes={setShowAuthorNotes}
          handleAuthorLanguageChange={handleAuthorLanguageChange}
          handleAuthorSelect={handleAuthorSelect}
          t={t}
        />
      </AnimatePresence>

      <DesktopBottomBar
        pages={pages}
        currentPage={currentPage}
        sliderValue={sliderValue}
        setSliderValue={setSliderValue}
        handlePageJump={handlePageJump}
        isSinglePageOverride={isSinglePageOverride}
        setIsSinglePageOverride={setIsSinglePageOverride}
        bookRef={bookRef}
        isAuthorPanelVisible={isAuthorPanelVisible}
        setIsAuthorPanelVisible={setIsAuthorPanelVisible}
        isAudioPanelVisible={isAudioPanelVisible}
        toggleAudioPanelVisibility={toggleAudioPanelVisibility}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        t={t}
      />
    </div>
  );
});
