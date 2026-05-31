import { motion } from 'framer-motion';
import { Headphones, SkipBack, SkipForward, Pause, Play, X } from 'lucide-react';

interface AudioPanelProps {
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
}

export function AudioPanel({
  isPlaying, currentSurahOnPage, currentTime, duration, seek, handleAudioToggle, pages, currentPage, onClose, onSkip
}: AudioPanelProps) {
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

        {/* Center: Controls & Progress */}
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

        {/* Right: Close */}
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
