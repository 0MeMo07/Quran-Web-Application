import React from 'react';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import { X, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { cn } from '../../../ui/cn';

interface MobileAudioPanelProps {
  open: boolean;
  onClose: () => void;
  isPlaying: boolean;
  handleAudioToggle: () => void;
  currentSurahOnPage: any;
  currentPage: number;
  pages: any[];
  bottomOffset: string;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

export const MobileAudioPanel = React.memo(function MobileAudioPanel({
  open,
  onClose,
  isPlaying,
  handleAudioToggle,
  currentSurahOnPage,
  currentPage,
  pages,
  bottomOffset,
  currentTime,
  duration,
  seek,
}: MobileAudioPanelProps) {
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSkip = (delta: number) => {
    const next = Math.max(0, Math.min(duration || 0, currentTime + delta));
    seek(next);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      direction="bottom"
      modal
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1140] bg-black/30 backdrop-blur-sm" />

        <Drawer.Content
          style={{ bottom: bottomOffset }}
          className={cn(
            'fixed inset-x-0 z-[1150]',
            'rounded-[2rem] mx-3 mb-3 overflow-hidden',
            'border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl'
          )}
        >
          <Drawer.Title className="sr-only">Sesli Okuma</Drawer.Title>

          <div className="flex justify-center pt-2.5 pb-0.5">
            <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-2 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 font-black">
                  Sesli Okuma
                </p>
                <p className="text-base font-semibold text-card-foreground leading-tight mt-1">
                  {currentSurahOnPage?.name ?? 'Sure'}
                  <span className="text-muted-foreground/40 font-medium ml-2 text-[11px]">
                    · Sayfa {pages[currentPage]?.number}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-muted-foreground transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <div className="relative h-6 flex items-center group">
                <div className="absolute inset-x-0 h-1.5 bg-muted rounded-full" />
                <div
                  className="absolute left-0 h-1.5 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg pointer-events-none transition-all duration-300 border-2 border-card"
                  style={{ left: `calc(${progress}% - 8px)` }}
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
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-bold tracking-wider tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-10">
              <button
                onClick={() => handleSkip(-5)}
                className="p-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-all active:scale-90"
                title="5 saniye geri"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleAudioToggle}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center',
                  'bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(var(--color-primary),0.2)]',
                  'active:opacity-80 transition-all'
                )}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </motion.button>

              <button
                onClick={() => handleSkip(5)}
                className="p-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-all active:scale-90"
                title="5 saniye ileri"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
});
