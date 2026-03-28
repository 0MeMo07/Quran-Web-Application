import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, BookOpen, FileText, LayoutGrid, ZoomIn, ZoomOut, Maximize2, Minimize2, Headphones, Settings } from 'lucide-react';
import HTMLPageFlip from 'react-pageflip';
import { cn } from '../../ui/cn';
import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from './hooks/useFlipBook';
import { FlippingMode } from '../../../store/slices/uiSlice';

// Sub-components
import { FlipBookPage } from './components/FlipBookPage';
import { AudioPanel } from './components/AudioPanel';
import { PageStack } from './components/PageStack';

interface DesktopFlipBookProps {
  onShowSettings: () => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  selectedSurah: string;
  handleSurahSelectChange: (val: string) => void;
  selectedVerse: string;
  setSelectedVerse: (val: string) => void;
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
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
  flippingMode: FlippingMode;
}

export const DesktopFlipBook = React.memo(function DesktopFlipBook(props: DesktopFlipBookProps) {
  const {
    onShowSettings, isNavOpen, setIsNavOpen, selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse, handleSearch, bookRef, pages, currentPage,
    zoomLevel, viewportScale, dragMarginX, dragMarginY, isSinglePageOverride,
    setIsSinglePageOverride, scrollContainerRef, onPage, handlePageJump,
    handleAudioToggle, isPlaying, currentSurahOnPage,
    currentTime, duration, seek,
    handleZoomIn, handleZoomOut, toggleFullscreen, isFullscreen, t, surahs,
    flippingMode
  } = props;

  const [isAudioPanelVisible, setIsAudioPanelVisible] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState<number | null>(null);

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

  // Centralized keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAudioPanelVisible) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          handleSkip(-5);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          handleSkip(5);
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleAudioToggle();
          return;
        }
      }

    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isAudioPanelVisible, currentTime, duration, isPlaying]);

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
        {!isNavOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-6 left-6 z-[70]"
          >
            <button
              onClick={() => setIsNavOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-card-foreground hover:bg-accent shadow-xl transition-all duration-300"
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
            className="absolute top-6 left-6 z-[70] bg-card border border-border rounded-xl px-4 py-2 flex items-center shadow-xl"
          >
            <button onClick={() => setIsNavOpen(false)} className="p-1 -ml-2 mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              className="bg-transparent border-none px-2 py-1.5 text-sm font-medium text-foreground hover:text-primary focus:outline-none focus:ring-0 [&>option]:bg-card cursor-pointer appearance-none outline-none"
              value={selectedSurah}
              onChange={(e) => handleSurahSelectChange(e.target.value)}
            >
              <option value="">{t.surahSelect || 'Sure Seç'}</option>
              {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
            </select>
            <div className="w-px h-4 bg-border mx-2" />
            <input
              type="number"
              placeholder={t.verseSelect || 'Ayet'}
              className="bg-transparent border-none px-2 py-1.5 text-sm font-medium text-foreground focus:outline-none w-16 text-center placeholder:text-muted-foreground/50"
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              min={1}
            />
            <button onClick={handleSearch} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-1">
              <Search className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border mx-3" />
            <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-1 py-1 flex items-center justify-center min-w-[2.5rem]">
              <span className="text-foreground text-sm font-bold">{pages[currentPage]?.number || 0}</span>
            </div>
            <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
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
                const idx = Math.round(el.scrollTop / LOGICAL_PAGE_HEIGHT);
                if (idx !== currentPage && idx >= 0 && idx < pages.length) {
                  onPage({ data: idx });
                }
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


      {/* Bottom Bar */}
      <div className="w-full h-12 bg-card border-t border-border flex items-center px-4 z-[70] shadow-xl shrink-0">
        <div className="flex items-center text-xs font-semibold text-foreground min-w-[140px]">
          Sayfa {pages[sliderValue === null ? currentPage : sliderValue]?.number || 0}
          <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">
            (İndeks: {(sliderValue === null ? currentPage : sliderValue) + 1}/{pages.length})
          </span>
        </div>
        <div className="flex-1 mx-4 relative h-1.5 bg-muted rounded-full overflow-hidden group/slider cursor-pointer flex items-center">
          <input
            type="range"
            min="0"
            max={Math.max(0, pages.length - 1)}
            value={sliderValue === null ? currentPage : sliderValue}
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            animate={{ width: `${((sliderValue === null ? currentPage : sliderValue) / Math.max(1, pages.length - 1)) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <button 
            onClick={() => {
              if (isSinglePageOverride) {
                handlePageJump(Math.max(0, currentPage - 1));
              } else {
                bookRef.current?.pageFlip()?.flipPrev();
              }
            }} 
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (isSinglePageOverride) {
                handlePageJump(Math.min(pages.length - 1, currentPage + 1));
              } else {
                bookRef.current?.pageFlip()?.flipNext();
              }
            }} 
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={() => setIsSinglePageOverride(true)} className={`p-1.5 transition-colors ${isSinglePageOverride ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} title="Dikey Kaydırma">
            <FileText className="w-4 h-4" />
          </button>
            <button onClick={() => setIsSinglePageOverride(false)} className={`p-1.5 transition-colors ${!isSinglePageOverride ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} title="Kitap Modu">
              <BookOpen className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" onClick={() => alert("Küçük resim görünümü yakında.")}><LayoutGrid className="w-4 h-4" /></button>
            <button 
              className={cn(
                "p-1.5 transition-colors shadow-sm",
                isAudioPanelVisible ? "text-primary bg-primary/5 rounded-lg" : "text-muted-foreground hover:text-foreground"
              )} 
              onClick={toggleAudioPanelVisibility} 
              title="Sesli Okuma"
            >
              {isAudioPanelVisible ? <Headphones className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={handleZoomOut} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={handleZoomIn} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
});
