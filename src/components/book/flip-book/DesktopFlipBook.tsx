import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, BookOpen, FileText, LayoutGrid, ZoomIn, ZoomOut, Maximize2, Minimize2, Play, Headphones, Pause, Settings, SkipBack, SkipForward, X } from 'lucide-react';
// @ts-ignore
import HTMLPageFlip from 'react-pageflip';
import { cn } from '../../ui/cn';
import { FlipBookPage } from './FlipBookPage';
import { LOGICAL_PAGE_HEIGHT, LOGICAL_PAGE_WIDTH } from './hooks/useFlipBook';

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
}

function AudioPanel({
  isPlaying, currentSurahOnPage, currentTime, duration, seek, handleAudioToggle, pages, currentPage, onClose, onSkip
}: {
  isPlaying: boolean;
  currentSurahOnPage: any;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  handleAudioToggle: () => void;
  pages: any[];
  currentPage: number;
  onClose: () => void;
  onSkip: (seconds: number) => void;
}) {
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="absolute bottom-12 left-0 right-0 z-[100] w-full bg-card/90 backdrop-blur-xl border-t border-border h-14 flex items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
    >
      <div className="w-full mx-auto px-6 h-full flex items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground/60 font-bold leading-none mb-0.5">
              SESLİ OKUMA
            </p>
            <p className="text-xs font-bold text-foreground leading-none">
              {currentSurahOnPage?.name ?? 'Sure'}
              <span className="text-muted-foreground/50 font-medium ml-2">
                S. {pages[currentPage]?.number}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Essential Controls & Progress Integrated */}
        <div className="flex-1 flex items-center gap-6 max-w-4xl">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => onSkip(-5)}
              className="text-foreground/40 hover:text-primary transition-all active:scale-90 p-1 group relative"
              title="5sn Geri"
            >
              <SkipBack className="w-6 h-6 fill-current opacity-60 group-hover:opacity-100" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary opacity-0 group-hover:opacity-100">-5s</span>
            </button>
            <button
              onClick={handleAudioToggle}
              className="w-11 h-11 rounded-full bg-primary text-secondary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>
            <button 
              onClick={() => onSkip(5)}
              className="text-foreground/40 hover:text-primary transition-all active:scale-90 p-1 group relative"
              title="5sn İleri"
            >
              <SkipForward className="w-6 h-6 fill-current opacity-60 group-hover:opacity-100" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary opacity-0 group-hover:opacity-100">+5s</span>
            </button>
          </div>
          
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-bold tabular-nums w-8 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 h-1 bg-muted rounded-full overflow-hidden group cursor-pointer hover:h-1.5 transition-all">
              <div
                className="absolute left-0 h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
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
            <span className="text-[10px] text-muted-foreground font-bold tabular-nums w-8 shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Close (Clean) */}
        <div className="min-w-[60px] flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground/30 hover:text-destructive transition-all hover:scale-110"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PageStack({ side, count, total, onJump, currentPage }: { 
  side: 'left' | 'right'; 
  count: number; 
  total: number; 
  onJump: (pageIndex: number) => void;
  currentPage: number;
}) {
  const [hoverPage, setHoverPage] = React.useState<number | null>(null);
  const [hoverY, setHoverY] = React.useState(0);
  const [hoverPercentX, setHoverPercentX] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visualThickness = Math.min(24, 4 + (count / total) * 20);
  const interactiveWidth = 32; 
  
  if (count <= 0) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relativeY = e.clientY - rect.top;
    
    let pageIndex: number;
    if (side === 'left') {
      pageIndex = Math.floor(relativeX * count);
    } else {
      const startPage = currentPage + 2;
      const remainingCount = total - startPage;
      pageIndex = startPage + Math.floor(relativeX * Math.max(1, remainingCount));
    }
    
    pageIndex = Math.max(0, Math.min(total - 1, pageIndex));
    setHoverPage(pageIndex);
    setHoverY(relativeY);
    setHoverPercentX(relativeX);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPage(null)}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (hoverPage !== null) onJump(hoverPage);
      }}
      className={cn(
        "absolute top-0 bottom-0 z-[500] cursor-pointer group flex items-stretch pointer-events-auto",
        side === 'left' ? "right-full mr-[-4px]" : "left-full ml-[-4px]"
      )}
      style={{ width: `${interactiveWidth}px` }}
    >
      {/* The Visual Part */}
      <div 
        className={cn(
          "h-full relative overflow-hidden transition-all duration-300",
          side === 'left' ? "w-full ml-auto" : "w-full mr-auto",
          hoverPage !== null ? "bg-white/10" : "bg-transparent"
        )}
        style={{ 
          width: `${visualThickness}px`,
          background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, 
            rgba(100, 100, 100, 0.7) 0%, 
            rgba(160, 160, 160, 0.4) 30%, 
            rgba(100, 100, 100, 0.7) 60%, 
            rgba(160, 160, 160, 0.4) 80%, 
            rgba(100, 100, 100, 0.7) 100%)`,
          boxShadow: side === 'left' 
            ? '-1px 0 2px rgba(0,0,0,0.1)' 
            : '1px 0 3px rgba(0,0,0,0.1)',
        }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{
            background: `repeating-linear-gradient(${side === 'left' ? 'to right' : 'to left'}, 
              transparent 0, 
              transparent 1px, 
              rgba(0,0,0,0.2) 1px, 
              rgba(0,0,0,0.2) 2px)`
          }} 
        />
        {/* Hover Highlight line */}
        <div className="absolute inset-y-0 w-[1px] bg-white opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ 
            left: `${hoverPercentX * visualThickness}px`
          }}
        />
      </div>

      {/* Tooltip positioned outside the visual part but same relative coord space */}
      <AnimatePresence>
        {hoverPage !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute z-[600] bg-zinc-800 text-white backdrop-blur-md px-2 py-1 rounded shadow-2xl pointer-events-none text-[10px] font-bold border border-white/10 whitespace-nowrap",
              side === 'left' ? "right-full mr-2" : "left-full ml-2"
            )}
            style={{ 
              top: hoverY - 12
            }}
          >
            Sayfa {hoverPage + 1}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopFlipBook(props: DesktopFlipBookProps) {
  const {
    onShowSettings, isNavOpen, setIsNavOpen, selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse, handleSearch, bookRef, pages, currentPage,
    zoomLevel, viewportScale, dragMarginX, dragMarginY, isSinglePageOverride,
    setIsSinglePageOverride, scrollContainerRef, onPage, handlePageJump,
    handleAudioToggle, isPlaying, currentSurahOnPage,
    currentTime, duration, seek,
    handleZoomIn, handleZoomOut, toggleFullscreen, isFullscreen, t, surahs
  } = props;

  const [isAudioPanelVisible, setIsAudioPanelVisible] = React.useState(false);

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

  // Centralized keyboard shortcuts with strict priority
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Audio controls priority
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

      // Page flipping secondary logic
      if (!isAudioPanelVisible) {
        if (e.key === 'ArrowLeft') {
          bookRef.current?.pageFlip()?.flipPrev();
        } else if (e.key === 'ArrowRight') {
          bookRef.current?.pageFlip()?.flipNext();
        }
      }
    };

    // Use capture phase (true) to intercept events before other components
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
            handleAudioToggle={handleAudioToggle} // This only toggles play/pause
            pages={pages}
            currentPage={currentPage}
            onClose={() => setIsAudioPanelVisible(false)} // Pass specific close handler
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
            x: zoomLevel <= 1.01 ? 0 : undefined,
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
                      className="scroll-page-container relative shadow-xl bg-card flex-shrink-0 rounded-sm"
                      style={{ width: LOGICAL_PAGE_WIDTH, height: LOGICAL_PAGE_HEIGHT }}
                    >
                      {isVisible ? (
                        <FlipBookPage number={p.number} total={pages.length} isLeft={p.isLeft} isMobile={false}>
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
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/10 z-50 -translate-x-1/2 pointer-events-none" />
              <HTMLPageFlip
                key="double"
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
                startZIndex={0}
                autoSize={false}
                clickEventForward={true}
                useMouseEvents={zoomLevel === 1}
                swipeDistance={zoomLevel === 1 ? 30 : 0}
                showPageCorners={false}
                disableFlipByClick={zoomLevel > 1}
                onFlip={onPage}
                className="quran-flipbook"
                style={{ backgroundColor: 'transparent', pointerEvents: zoomLevel > 1 ? 'none' : 'auto' }}
              >
                {pages.map((p, idx) => {
                  const isVisible = Math.abs(idx - currentPage) <= 10;
                  return (
                    <div 
                      key={p.number} 
                      className="page-wrapper" 
                      style={{ 
                        width: LOGICAL_PAGE_WIDTH, 
                        height: LOGICAL_PAGE_HEIGHT,
                        pointerEvents: 'auto'
                      }}
                    >
                      {isVisible ? (
                        <FlipBookPage number={p.number} total={pages.length} isLeft={p.isLeft} isMobile={false}>
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

              {/* Page Stacks (3D Effect) */}
              {zoomLevel <= 1.01 && (
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
            </>
          )}
        </motion.div>
      </motion.div>


      {/* Bottom Bar */}
      <div className="w-full h-12 bg-card border-t border-border flex items-center px-4 z-[70] shadow-xl shrink-0">
        <div className="flex items-center text-xs font-semibold text-foreground min-w-[140px]">
          Sayfa {pages[currentPage]?.number || 0}
          <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">(İndeks: {currentPage + 1}/{pages.length})</span>
        </div>
        <div className="flex-1 mx-4 relative h-1.5 bg-muted rounded-full overflow-hidden group/slider cursor-pointer flex items-center">
          <input
            type="range"
            min="0"
            max={Math.max(0, pages.length - 1)}
            value={currentPage}
            onChange={(e) => handlePageJump(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            animate={{ width: `${(currentPage / Math.max(1, pages.length - 1)) * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={() => handlePageJump(Math.max(0, currentPage - 1))} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Play className="w-4 h-4 rotate-180 fill-current" />
          </button>
          <button onClick={() => handlePageJump(Math.min(pages.length - 1, currentPage + 1))} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Play className="w-4 h-4 fill-current" />
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
}
