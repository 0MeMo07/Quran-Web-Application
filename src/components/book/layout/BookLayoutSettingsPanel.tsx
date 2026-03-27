import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { type ViewType, type BookLayoutType } from '../../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BookOpen, Languages, Type, AlignLeft, Minus, Plus } from 'lucide-react';

interface BookLayoutSettingsPanelProps {
  showSettings: boolean;
  onClose: () => void;
  t: ReturnType<typeof import('../../../translations').useTranslations>;
  viewType: ViewType;
  onSetViewType: (viewType: ViewType) => void;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  lineHeight: number;
  setLineHeight: Dispatch<SetStateAction<number>>;
  bookLayoutType: BookLayoutType;
  onSetBookLayoutType: (layout: BookLayoutType) => void;
}

export function BookLayoutSettingsPanel({
  showSettings,
  onClose,
  t,
  viewType,
  onSetViewType,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  bookLayoutType,
  onSetBookLayoutType,
}: BookLayoutSettingsPanelProps) {
  const viewOptions = useMemo(() => [
    { type: 'meal' as const, icon: FileText, label: 'Meal' },
    { type: 'meal+kuran' as const, icon: BookOpen, label: 'M+K' },
    { type: 'kuran' as const, icon: Languages, label: 'Kuran' },
  ], []);

  return (
    <AnimatePresence>
      {showSettings && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-sm max-h-[90vh] bg-background/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            <div className="p-7 space-y-7 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <Type className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/90">
                    {t.settings?.title}
                  </h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2.5 hover:bg-secondary/50 rounded-full transition-colors text-muted-foreground hover:text-foreground active:scale-90"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                  İçerik Görünümü
                </label>
                <div className="grid grid-cols-3 p-1 bg-secondary/30 rounded-2xl relative">
                  {viewOptions.map((opt) => {
                    const isActive = viewType === opt.type;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        onClick={() => onSetViewType(opt.type)}
                        className={`relative flex flex-col items-center gap-1.5 py-4 transition-all duration-300 z-10 ${
                          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-view-bg"
                            className="absolute inset-0 bg-background rounded-xl shadow-lg border border-white/5"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon className="w-4 h-4 relative z-20" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter relative z-20">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                  Sayfa Düzeni
                </label>
                <div className="grid grid-cols-2 p-1 bg-secondary/30 rounded-2xl relative">
                  {(['standard', 'pageflip'] as const).map((type) => {
                    const isActive = bookLayoutType === type;
                    const label = type === 'standard' ? 'Sıralı' : 'Kitap';
                    return (
                      <button
                        key={type}
                        onClick={() => onSetBookLayoutType(type)}
                        className={`relative flex flex-col items-center gap-1.5 py-4 transition-all duration-300 z-10 ${
                          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-layout-bg"
                            className="absolute inset-0 bg-background rounded-xl shadow-lg border border-white/5"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-tighter relative z-20">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-7 px-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      <span>{t.settings?.fontSize}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-primary/10 rounded-lg text-primary font-mono text-xs tracking-wider">{fontSize}px</span>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                      className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-white/5 active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1 group py-2">
                      <input
                        type="range"
                        min="12"
                        max={viewType === 'kuran' ? '32' : '24'}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-secondary/50 rounded-full appearance-none cursor-pointer group-hover:bg-secondary transition-colors
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:bg-primary
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:shadow-2xl
                          [&::-webkit-slider-thumb]:border-4
                          [&::-webkit-slider-thumb]:border-background
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-webkit-slider-thumb]:active:scale-95"
                      />
                    </div>
                    <button 
                      onClick={() => setFontSize(Math.min(viewType === 'kuran' ? 32 : 24, fontSize + 1))}
                      className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-white/5 active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="w-4 h-4" />
                      <span>{t.settings?.lineHeight}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-primary/10 rounded-lg text-primary font-mono text-xs tracking-wider">{lineHeight.toFixed(1)}x</span>
                  </div>

                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setLineHeight(Math.max(1, lineHeight - 0.1))}
                      className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-white/5 active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1 group py-2">
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(Number(e.target.value))}
                        className="w-full h-2 bg-secondary/50 rounded-full appearance-none cursor-pointer group-hover:bg-secondary transition-colors
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:bg-primary
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:shadow-2xl
                          [&::-webkit-slider-thumb]:border-4
                          [&::-webkit-slider-thumb]:border-background
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-webkit-slider-thumb]:active:scale-95"
                      />
                    </div>
                    <button 
                      onClick={() => setLineHeight(Math.min(2, lineHeight + 0.1))}
                      className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-white/5 active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                  Önizleme
                </label>
                <div className="p-5 bg-secondary/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <div 
                    className="space-y-5 transition-all duration-300"
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                  >
                    {(viewType === 'kuran' || viewType === 'meal+kuran') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif leading-tight text-right dir-rtl opacity-90"
                      >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </motion.div>
                    )}
                    {(viewType === 'meal' || viewType === 'meal+kuran') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground/80 font-medium"
                      >
                        Rahman ve Rahim olan Allah'ın adıyla.
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
