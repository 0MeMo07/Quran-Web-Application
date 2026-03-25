import { type Dispatch, type SetStateAction } from 'react';
import { type ViewType } from '../../store/slices/uiSlice';
import { motion } from 'framer-motion';

interface BookLayoutSettingsPanelProps {
  showSettings: boolean;
  t: ReturnType<typeof import('../../translations').useTranslations>;
  viewType: ViewType;
  onSetViewType: (viewType: ViewType) => void;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  lineHeight: number;
  setLineHeight: Dispatch<SetStateAction<number>>;
}

export function BookLayoutSettingsPanel({
  showSettings,
  t,
  viewType,
  onSetViewType,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
}: BookLayoutSettingsPanelProps) {
  return (
    <div className={`fixed right-6 top-32 z-50 bg-background/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-white/10 ${
      showSettings ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'
    }`}>
      <div className="p-6 space-y-8 w-80">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-foreground tracking-tight">
            {t.settings?.title}
          </h3>
        </div>

        {/* View Type Selection: Segmented List */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
            {t.settings.viewType.title}
          </label>
          <div className="flex flex-col gap-2.5">
            {([
              { type: 'meal', icon: '📝', label: t.settings.viewType.mealOnly },
              { type: 'kuran+meal', icon: '📖', label: t.settings.viewType.quranAndMeal },
              { type: 'kuran', icon: '🕌', label: t.settings.viewType.quranOnly },
            ] as const).map(({ type, icon, label }) => {
              const isActive = viewType === type;
              return (
                <button
                  key={type}
                  onClick={() => onSetViewType(type)}
                  className={`
                    relative group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300
                    ${isActive 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'hover:bg-secondary/50 border-transparent'
                    }
                    border
                  `}
                >
                  <div className={`
                    text-2xl w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary/80'}
                  `}>
                    {icon}
                  </div>
                  <div className="flex-1 flex flex-col items-start">
                    <span className={`text-sm font-bold transition-colors ${isActive ? 'text-primary' : 'text-foreground/80'}`}>
                      {label}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-view-dot"
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* Sliders Section */}
        <div className="space-y-6">
          {/* Font Size */}
          <div className="group">
            <div className="flex justify-between items-end mb-4 px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t.settings?.fontSize}
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{fontSize}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">px</span>
              </div>
            </div>
            <div className="relative flex items-center h-6">
              <div className="absolute inset-0 h-1 my-auto bg-secondary/80 rounded-full" />
              <div 
                className="absolute inset-y-0 left-0 h-1 my-auto bg-primary rounded-full transition-all duration-200"
                style={{ width: `${((fontSize - 12) / (viewType === 'kuran' ? 20 : 12)) * 100}%` }}
              />
              <input
                type="range"
                min="12"
                max={viewType === 'kuran' ? '32' : '24'}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:bg-surface
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-primary
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-webkit-slider-thumb]:active:scale-95"
              />
            </div>
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{t.settings?.smaller}</span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{t.settings?.larger}</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="group">
            <div className="flex justify-between items-end mb-4 px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t.settings?.lineHeight}
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{lineHeight.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">x</span>
              </div>
            </div>
            <div className="relative flex items-center h-6">
              <div className="absolute inset-0 h-1 my-auto bg-secondary/80 rounded-full" />
              <div 
                className="absolute inset-y-0 left-0 h-1 my-auto bg-primary rounded-full transition-all duration-200"
                style={{ width: `${((lineHeight - 1) / 1) * 100}%` }}
              />
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:bg-surface
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-primary
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-webkit-slider-thumb]:active:scale-95"
              />
            </div>
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{t.settings?.lineHeightTight}</span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{t.settings?.lineHeightRelaxed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
