import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScrubberRowProps {
  currentPage: number;
  pages: any[];
  handlePageJump: (i: number) => void;
  bookRef: React.RefObject<any>;
  isSinglePageOverride: boolean;
  sliderValue: number | null;
  setSliderValue: (v: number | null) => void;
}

export const ScrubberRow = React.memo(function ScrubberRow({
  currentPage,
  pages,
  handlePageJump,
  bookRef,
  isSinglePageOverride,
  sliderValue,
  setSliderValue,
}: ScrubberRowProps) {
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
