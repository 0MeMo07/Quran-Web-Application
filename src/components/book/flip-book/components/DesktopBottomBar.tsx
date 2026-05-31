import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  UserRound,
  Headphones,
  ZoomOut,
  ZoomIn,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { cn } from '../../../ui/cn';

interface DesktopBottomBarProps {
  pages: any[];
  currentPage: number;
  sliderValue: number | null;
  setSliderValue: (val: number | null) => void;
  handlePageJump: (index: number) => void;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean) => void;
  bookRef: React.RefObject<any>;
  isAuthorPanelVisible: boolean;
  setIsAuthorPanelVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  isAudioPanelVisible: boolean;
  toggleAudioPanelVisibility: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
}

export const DesktopBottomBar = React.memo(function DesktopBottomBar({
  pages,
  currentPage,
  sliderValue,
  setSliderValue,
  handlePageJump,
  isSinglePageOverride,
  setIsSinglePageOverride,
  bookRef,
  isAuthorPanelVisible,
  setIsAuthorPanelVisible,
  isAudioPanelVisible,
  toggleAudioPanelVisibility,
  handleZoomIn,
  handleZoomOut,
  toggleFullscreen,
  isFullscreen,
  t,
}: DesktopBottomBarProps) {
  return (
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
          animate={{
            width: `${
              ((sliderValue === null ? currentPage : sliderValue) /
                Math.max(1, pages.length - 1)) *
              100
            }%`,
          }}
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
        <button
          onClick={() => setIsSinglePageOverride(true)}
          className={`p-1.5 transition-colors ${
            isSinglePageOverride
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Dikey Kaydırma"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsSinglePageOverride(false)}
          className={`p-1.5 transition-colors ${
            !isSinglePageOverride
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Kitap Modu"
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button
          className={cn(
            'p-1.5 transition-colors',
            isAuthorPanelVisible
              ? 'text-primary bg-primary/5 rounded-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setIsAuthorPanelVisible((prev) => !prev)}
          title={t.sidebar?.selectTranslator || 'Çevirmen Seç'}
        >
          <UserRound className="w-4 h-4" />
        </button>
        <button
          className={cn(
            'p-1.5 transition-colors shadow-sm',
            isAudioPanelVisible
              ? 'text-primary bg-primary/5 rounded-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={toggleAudioPanelVisibility}
          title="Sesli Okuma"
        >
          <Headphones className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
});
