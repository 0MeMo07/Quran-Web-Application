import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DesktopTopNavProps {
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  selectedSurah: string;
  handleSurahSelectChange: (val: string) => void;
  selectedVerse: string;
  setSelectedVerse: (val: string) => void;
  availableVerses: number[];
  selectedSurahMeta: any;
  handleSearch: () => void;
  bookRef: React.RefObject<any>;
  pages: any[];
  currentPage: number;
  surahs: any[];
  t: any;
}

export const DesktopTopNav = React.memo(function DesktopTopNav({
  isNavOpen,
  setIsNavOpen,
  selectedSurah,
  handleSurahSelectChange,
  selectedVerse,
  setSelectedVerse,
  availableVerses,
  selectedSurahMeta,
  handleSearch,
  bookRef,
  pages,
  currentPage,
  surahs,
  t,
}: DesktopTopNavProps) {
  return (
    <AnimatePresence>
      {!isNavOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-6 left-6 z-[70]"
        >
          <button
            onClick={() => setIsNavOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-card-foreground hover:bg-accent shadow-xl transition-all duration-300"
            title="Arama ve Navigasyon"
          >
            <Search className="w-5 h-5" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="absolute top-6 left-6 z-[70] bg-card border border-border rounded-2xl px-3 py-2 flex items-center shadow-xl"
        >
          <button onClick={() => setIsNavOpen(false)} className="p-1 -ml-2 mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <select
            className="h-8 min-w-[160px] rounded-lg bg-card border border-border px-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary/60 [&>option]:bg-[hsl(var(--background))] cursor-pointer appearance-none"
            value={selectedSurah}
            onChange={(e) => handleSurahSelectChange(e.target.value)}
          >
            <option value="">{t.surahSelect || 'Sure Seç'}</option>
            {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
          </select>
          <div className="w-px h-4 bg-border mx-2" />
          <select
            className="h-8 w-20 rounded-lg bg-card border border-border px-2 text-sm font-medium text-foreground focus:outline-none focus:border-primary/60 [&>option]:bg-[hsl(var(--background))] cursor-pointer appearance-none"
            value={selectedVerse}
            onChange={(e) => setSelectedVerse(e.target.value)}
            disabled={!selectedSurahMeta || availableVerses.length === 0}
          >
            <option value="">{t.verse?.verse || 'Ayet'}</option>
            {availableVerses.map((verseNumber) => (
              <option key={verseNumber} value={verseNumber}>{verseNumber}</option>
            ))}
          </select>
          <button onClick={handleSearch} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground bg-card border border-border hover:bg-accent transition-colors ml-1" title={t.header?.search || 'Ara'}>
            <Search className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-3" />
          <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-1 py-1 flex items-center justify-center min-w-[2.5rem]">
            <span className="text-foreground text-sm font-bold">{pages[currentPage]?.number || 0}</span>
          </div>
          <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
