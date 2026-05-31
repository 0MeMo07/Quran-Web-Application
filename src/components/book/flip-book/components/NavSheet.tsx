import React from 'react';
import { Drawer } from 'vaul';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../ui/cn';

interface NavSheetProps {
  open: boolean;
  onClose: () => void;
  selectedSurah: string;
  handleSurahSelectChange: (v: string) => void;
  selectedVerse: string;
  setSelectedVerse: (v: string) => void;
  onSearch: () => void;
  currentPage: number;
  pages: any[];
  handlePageJump: (i: number) => void;
  t: any;
  surahs: any[];
}

export const NavSheet = React.memo(function NavSheet({
  open,
  onClose,
  selectedSurah,
  handleSurahSelectChange,
  selectedVerse,
  setSelectedVerse,
  onSearch,
  currentPage,
  pages,
  handlePageJump,
  t,
  surahs,
}: NavSheetProps) {
  const selectedSurahMeta = React.useMemo(
    () => surahs.find((surah) => surah.id === Number(selectedSurah)),
    [surahs, selectedSurah],
  );

  const availableVerses = React.useMemo(() => {
    const totalVerseCount = Number(selectedSurahMeta?.verse_count ?? 0);
    if (!selectedSurahMeta || totalVerseCount <= 0) {
      return [] as number[];
    }

    return Array.from({ length: totalVerseCount }, (_, index) => index + 1);
  }, [selectedSurahMeta]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      direction="top"
      modal
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1190] bg-black/40 backdrop-blur-sm" />

        <Drawer.Content
          className={cn(
            'fixed top-0 inset-x-0 z-[1200]',
            'bg-[#0d0d0d]/95 backdrop-blur-2xl',
            'border-b border-white/[0.07]',
            'shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
            'rounded-b-3xl overflow-hidden',
            'pt-[env(safe-area-inset-top)]',
          )}
        >
          <Drawer.Title className="sr-only">Navigasyon</Drawer.Title>

          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-white/15" />
          </div>

          <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black tracking-[0.18em] uppercase text-white/25 select-none">
                Navigasyon
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 active:scale-90 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedSurah}
                  onChange={(e) => handleSurahSelectChange(e.target.value)}
                  className={cn(
                    'w-full h-11 rounded-2xl px-4 pr-10 text-sm font-medium text-white',
                    'bg-white/[0.06] border border-white/[0.09]',
                    'focus:outline-none focus:border-white/20',
                    'transition-all appearance-none',
                  )}
                >
                  <option value="">{t?.surahSelect ?? 'Sure sec'}</option>
                  {surahs.map((s) => (
                    <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 rotate-90 pointer-events-none" />
              </div>

              <select
                value={selectedVerse}
                onChange={(e) => setSelectedVerse(e.target.value)}
                disabled={!selectedSurahMeta || availableVerses.length === 0}
                className={cn(
                  'w-20 h-11 rounded-2xl px-3 text-sm font-medium text-white text-center',
                  'bg-white/[0.06] border border-white/[0.09]',
                  'focus:outline-none focus:border-white/20',
                  'transition-all appearance-none',
                )}
              >
                <option value="">{t?.versePlaceholder ?? 'Ayet'}</option>
                {availableVerses.map((verseNumber) => (
                  <option key={verseNumber} value={verseNumber}>{verseNumber}</option>
                ))}
              </select>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onSearch}
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                  'bg-white/10 border border-white/[0.09] text-white/70',
                  'active:bg-white/15 transition-all',
                )}
              >
                <Search className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] border border-white/[0.06] px-2 h-11">
              <button
                onClick={() => handlePageJump(Math.max(0, currentPage - 1))}
                className="p-2 text-white/40 hover:text-white/70 active:scale-90 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-white/90 font-semibold text-sm leading-none tabular-nums">
                  {pages[currentPage]?.number ?? '—'}
                </span>
                <span className="text-white/25 text-[10px] mt-0.5">
                  {currentPage + 1} / {pages.length}
                </span>
              </div>
              <button
                onClick={() => handlePageJump(Math.min(pages.length - 1, currentPage + 1))}
                className="p-2 text-white/40 hover:text-white/70 active:scale-90 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
});
