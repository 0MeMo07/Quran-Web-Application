import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, FileText, BookOpen, UserRound, Headphones, ZoomOut, ZoomIn, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../../../ui/cn';

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

interface MobileBottomBarProps {
  currentPage: number;
  pages: any[];
  isScrubberVisible: boolean;
  setIsScrubberVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  isSinglePageOverride: boolean;
  setIsSinglePageOverride: (override: boolean | ((prev: boolean) => boolean)) => void;
  isAudioActive: boolean;
  isAudioPanelOpen: boolean;
  onHeadphonePress: () => void;
  isAuthorSheetOpen: boolean;
  onAuthorPress: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  t: any;
}

export const MobileBottomBar = React.memo(function MobileBottomBar({
  currentPage,
  pages,
  isScrubberVisible,
  setIsScrubberVisible,
  isSinglePageOverride,
  setIsSinglePageOverride,
  isAudioActive,
  isAudioPanelOpen,
  onHeadphonePress,
  isAuthorSheetOpen,
  onAuthorPress,
  handleZoomIn,
  handleZoomOut,
  toggleFullscreen,
  isFullscreen,
  t,
}: MobileBottomBarProps) {
  return (
    <div className="w-full h-14 bg-card/90 backdrop-blur-xl border-t border-border flex items-center justify-between px-3 z-[1100] shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)] h-[calc(56px+env(safe-area-inset-bottom))] shrink-0 pointer-events-auto">
      {/* 1. Scrubber toggle */}
      <div className="flex items-center">
        <BarBtn
          active={isScrubberVisible}
          onClick={() => setIsScrubberVisible((v) => !v)}
          title="Scrubber"
        >
          {isScrubberVisible ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
        </BarBtn>
        <span className="text-[11px] font-bold text-foreground/40 leading-none tracking-wider select-none pr-1">
          S. {pages[currentPage]?.number || '—'}
        </span>
      </div>

      {/* 2. Controls center */}
      <div className="flex items-center gap-1">
        {/* View Mode Toggle */}
        <BarBtn
          active={isSinglePageOverride}
          onClick={() => setIsSinglePageOverride((v) => !v)}
          title="Kaydirma Modu"
        >
          {isSinglePageOverride ? <FileText className="w-[18px] h-[18px]" /> : <BookOpen className="w-[18px] h-[18px]" />}
        </BarBtn>

        {/* Translator Popover Trigger */}
        <BarBtn
          active={isAuthorSheetOpen}
          onClick={onAuthorPress}
          title={t.sidebar?.selectTranslator || 'Cevirmen Sec'}
        >
          <UserRound className="w-[18px] h-[18px]" />
        </BarBtn>

        {/* Audio Player Trigger */}
        <BarBtn
          active={isAudioPanelOpen}
          accent={isAudioActive}
          onClick={onHeadphonePress}
          title="Sesli Okuma"
        >
          <Headphones className={cn('w-[18px] h-[18px]', isAudioActive && 'animate-pulse')} />
        </BarBtn>
      </div>

      {/* 3. Zoom / Screen controls */}
      <div className="flex items-center gap-0.5">
        <BarBtn onClick={handleZoomOut} title="Uzaklastir"><ZoomOut className="w-[18px] h-[18px]" /></BarBtn>
        <BarBtn onClick={handleZoomIn} title="Yakinlastir"><ZoomIn className="w-[18px] h-[18px]" /></BarBtn>
        <BarBtn onClick={toggleFullscreen} title="Tam Ekran">
          {isFullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
        </BarBtn>
      </div>
    </div>
  );
});
