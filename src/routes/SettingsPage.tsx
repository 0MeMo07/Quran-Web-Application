import { Link } from 'react-router-dom';
import { Moon, Sun, Palette, ArrowLeft, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectIsDarkMode, selectVisualTheme, setVisualTheme } from '../store/slices/uiSlice';
import { useTranslations } from '../translations';
import { GlassCard } from '../components/ui';
import { ShimmerButton } from '../components/ui';

export function SettingsPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const isDarkMode = useSelector(selectIsDarkMode);
  const visualTheme = useSelector(selectVisualTheme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t.header.settings}
          </h1>
        </div>

        <div className="space-y-4">
          {/* Dark mode toggle */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t.header.toggleTheme}
              </h2>
            </div>
            <ShimmerButton
              onClick={() => dispatch(toggleTheme())}
              className="w-full sm:w-auto rounded-xl"
            >
              {isDarkMode ? (
                <><Sun className="w-4 h-4" />{t.header.lightMode}</>
              ) : (
                <><Moon className="w-4 h-4" />{t.header.darkMode}</>
              )}
            </ShimmerButton>
          </GlassCard>

          {/* Visual theme */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t.header.themeStyle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'default', label: t.header.currentTheme },
                { key: 'simple', label: t.header.simpleTheme },
              ] as const).map(({ key, label }) => {
                const isActive = visualTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => dispatch(setVisualTheme(key))}
                    className={[
                      'relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm shadow-emerald-500/10'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700/60',
                    ].join(' ')}
                  >
                    {isActive && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
