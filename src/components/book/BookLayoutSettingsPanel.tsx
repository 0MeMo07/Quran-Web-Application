import { type Dispatch, type SetStateAction } from 'react';
import { type ViewType } from '../../store/slices/uiSlice';

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
    <div className={`fixed right-4 top-32 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-all duration-300 ${
      showSettings ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
    }`}>
      <div className="p-4 space-y-6 w-72">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t.settings?.title}
        </h3>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.settings.viewType.title}
          </label>
          <div className="flex flex-col gap-2">
            {([
              { type: 'meal', icon: '📝', label: t.settings.viewType.mealOnly },
              { type: 'kuran+meal', icon: '📖', label: t.settings.viewType.quranAndMeal },
              { type: 'kuran', icon: '🕌', label: t.settings.viewType.quranOnly },
            ] as const).map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => onSetViewType(type)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${viewType === type
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transform scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.01]'
                  }
                `}
              >
                <span className="text-xl bg-white/10 p-2 rounded-lg">{icon}</span>
                <span className="flex-1 text-left text-sm font-medium">{label}</span>
                {viewType === type && (
                  <div className="w-2 h-2 rounded-full bg-white shadow-lg animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.settings?.fontSize}
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{t.settings?.smaller}</span>
              <input
                type="range"
                min="12"
                max={viewType === 'kuran' ? '32' : '24'}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:w-4
                  [&::-webkit-slider-thumb]:hover:h-4"
              />
              <span className="text-sm text-gray-500">{t.settings?.larger}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.settings?.lineHeight}
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {lineHeight.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{t.settings?.lineHeightTight}</span>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:w-4
                  [&::-webkit-slider-thumb]:hover:h-4"
              />
              <span className="text-sm text-gray-500">{t.settings?.lineHeightRelaxed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
