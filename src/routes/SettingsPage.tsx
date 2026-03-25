import { Link } from 'react-router-dom';
import { Palette, ArrowLeft, Check } from 'lucide-react';
import { cn } from '../components/ui/cn';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsDarkMode, selectVisualTheme, setTheme } from '../store/slices/uiSlice';
import { useTranslations } from '../translations';
import { GlassCard } from '../components/ui';

export function SettingsPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const isDarkMode = useSelector(selectIsDarkMode);
  const visualTheme = useSelector(selectVisualTheme);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            {t.header.settings}
          </h1>
        </div>

        <div className="space-y-4">
          {/* Unified Theme Selector */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-serif font-bold text-foreground">
                {t.header.themeStyle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { id: 'flagshipLight', isDark: false, vTheme: 'default', label: t.header.themes.flagshipLight, colors: ['bg-white', 'bg-emerald-500'] },
                { id: 'flagshipDark', isDark: true, vTheme: 'default', label: t.header.themes.flagshipDark, colors: ['bg-slate-900', 'bg-emerald-500'] },
                { id: 'simpleLight', isDark: false, vTheme: 'simple', label: t.header.themes.simpleLight, colors: ['bg-[#fafafa]', 'bg-zinc-900'] },
                { id: 'simpleDark', isDark: true, vTheme: 'simple', label: t.header.themes.simpleDark, colors: ['bg-[#09090b]', 'bg-zinc-100'] },
              ] as const).map(({ id, isDark, vTheme, label, colors }) => {
                const isActive = isDarkMode === isDark && visualTheme === vTheme;
                return (
                  <button
                    key={id}
                    onClick={() => dispatch(setTheme({ isDarkMode: isDark, visualTheme: vTheme }))}
                    className={[
                      'group relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border bg-surface/50 hover:bg-secondary hover:border-primary/30',
                    ].join(' ')}
                  >
                    {/* Visual Preview */}
                    <div className={['w-full h-24 rounded-2xl overflow-hidden shadow-inner border border-border/50 flex flex-col p-3 gap-2', colors[0]].join(' ')}>
                       <div className={['w-1/2 h-2 rounded-full opacity-20', isDark ? 'bg-white' : 'bg-black'].join(' ')} />
                       <div className={['w-1/3 h-1.5 rounded-full opacity-10', isDark ? 'bg-white' : 'bg-black'].join(' ')} />
                       <div className="mt-auto space-y-1.5 opacity-40">
                          <div className={['w-full h-1 rounded-full', isDark ? 'bg-white' : 'bg-black'].join(' ')} />
                          <div className={['w-2/3 h-1 rounded-full', isDark ? 'bg-white' : 'bg-black'].join(' ')} />
                       </div>
                       <div className={cn('absolute bottom-4 right-4 w-6 h-6 rounded-lg border border-border/20 shadow-sm flex items-center justify-center', isDark ? 'bg-white/5' : 'bg-black/5')}>
                          <div className={cn('h-2 w-2 rounded-full', colors[1])} />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full px-1">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                        isActive ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}>
                        {isActive && <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />}
                      </div>
                      <span className={cn('text-sm font-semibold transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                        {label}
                      </span>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-highlight"
                        className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-offset-4 ring-offset-background/50 pointer-events-none"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
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
