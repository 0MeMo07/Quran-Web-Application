import { Link } from 'react-router-dom';
import { Moon, Sun, Palette, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectIsDarkMode, selectVisualTheme, setVisualTheme } from '../store/slices/uiSlice';
import { useTranslations } from '../translations';

export function SettingsPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const isDarkMode = useSelector(selectIsDarkMode);
  const visualTheme = useSelector(selectVisualTheme);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
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
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.header.toggleTheme}</h2>
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? t.header.lightMode : t.header.darkMode}</span>
            </button>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.header.themeStyle}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => dispatch(setVisualTheme('default'))}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  visualTheme === 'default'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.header.currentTheme}
              </button>
              <button
                onClick={() => dispatch(setVisualTheme('simple'))}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  visualTheme === 'simple'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.header.simpleTheme}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
