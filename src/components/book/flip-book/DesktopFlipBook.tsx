import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, BookOpen, FileText, LayoutGrid, ZoomIn, ZoomOut, Maximize2, Minimize2, Play, Headphones, Pause, Settings } from 'lucide-react';
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
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
  surahs: any[];
}

export function DesktopFlipBook(props: DesktopFlipBookProps) {
  const {
    onShowSettings, isNavOpen, setIsNavOpen, selectedSurah, handleSurahSelectChange,
    selectedVerse, setSelectedVerse, handleSearch, bookRef, pages, currentPage,
    zoomLevel, viewportScale, dragMarginX, dragMarginY, isSinglePageOverride,
    setIsSinglePageOverride, scrollContainerRef, onPage, handlePageJump,
    handleAudioToggle, isPlaying, currentAudioId, currentSurahOnPage,
    handleZoomIn, handleZoomOut, toggleFullscreen, isFullscreen, t, surahs
  } = props;

  return (
    <div className="flex flex-col justify-between items-center w-full h-full bg-[#0a0a0a] overflow-hidden relative transition-all duration-500">
      {/* Top Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-6 right-6 z-[70]"
      >
        <button
          onClick={onShowSettings}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white shadow-2xl transition-all duration-300"
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
                      className="scroll-page-container relative shadow-xl bg-[#fdfbf7] flex-shrink-0 rounded-sm"
                      style={{ width: LOGICAL_PAGE_WIDTH, height: LOGICAL_PAGE_HEIGHT }}
                    >
                      {isVisible ? (
                        <FlipBookPage number={p.number} total={pages.length} isLeft={p.isLeft} isMobile={false}>
                          {null}
                        </FlipBookPage>
                      ) : (
                        <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center">
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
                style={{ backgroundColor: '#fdfbf7', pointerEvents: zoomLevel > 1 ? 'none' : 'auto' }}
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
                        <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center border border-black/5 opacity-50">
                          <span className="text-black/5 font-serif text-2xl">{p.number}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </HTMLPageFlip>
            </>
          )}
        </motion.div>
      </motion.div>


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
          <button onClick={() => setIsSinglePageOverride(true)} className={`p-1.5 transition-colors ${isSinglePageOverride ? 'text-white' : 'text-white/50 hover:text-white/80'}`} title="Dikey Kaydırma">
            <FileText className="w-4 h-4" />
          </button>
            <button onClick={() => setIsSinglePageOverride(false)} className={`p-1.5 transition-colors ${!isSinglePageOverride ? 'text-white' : 'text-white/50 hover:text-white/80'}`} title="Kitap Modu">
              <BookOpen className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-white/50 hover:text-white/80 transition-colors" onClick={() => alert("Küçük resim görünümü yakında.")}><LayoutGrid className="w-4 h-4" /></button>
            <button 
              className={cn(
                "p-1.5 transition-colors",
                (isPlaying && currentAudioId === currentSurahOnPage?.id) ? "text-primary" : "text-white/50 hover:text-white/80"
              )} 
              onClick={handleAudioToggle} 
              title="Sesli Okuma"
            >
              {(isPlaying && currentAudioId === currentSurahOnPage?.id) ? <Pause className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
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
