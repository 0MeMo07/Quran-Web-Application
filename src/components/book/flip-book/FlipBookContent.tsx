import React from 'react';
import { useFlipBook } from './hooks/useFlipBook';
import { MobileFlipBook } from './MobileFlipBook';
import { DesktopFlipBook } from './DesktopFlipBook';

interface FlipBookContentProps {
  propPage?: number;
  onPageChange?: (page: number) => void;
  onShowSettings?: () => void;
  t: any;
}

/**
 * FlipBookContent component
 * Orchestrates the FlipBook experience, switching between Mobile and Desktop views.
 */
export function FlipBookContent({ propPage, onPageChange, onShowSettings, t }: FlipBookContentProps) {
  const flipBook = useFlipBook({ propPage, onPageChange, t });

  if (flipBook.pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/20 animate-spin" />
        <p className="text-sm font-medium tracking-widest uppercase opacity-50">{t.loading || 'Yükleniyor'}...</p>
      </div>
    );
  }

  // Combine hook state with memoized props to prevent unnecessary re-renders
  const commonProps = React.useMemo(() => ({
    ...flipBook,
    onShowSettings: onShowSettings || (() => {}),
    t,
  }), [flipBook, onShowSettings, t]);

  return flipBook.isMobile ? (
    <MobileFlipBook {...commonProps} />
  ) : (
    <DesktopFlipBook {...commonProps} />
  );
}
