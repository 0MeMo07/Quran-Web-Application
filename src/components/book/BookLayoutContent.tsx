import { type Verse, type Surah } from '../../api/types';
import { type ViewType } from '../../store/slices/uiSlice';
import { BookLayoutLoadingOverlay } from './BookLayoutLoadingOverlay';
import { BookLayoutSurahSection } from './BookLayoutSurahSection';
import { motion } from 'framer-motion';

interface BookLayoutContentProps {
  isLoading: boolean;
  loadingText: string;
  versesBySurah: Record<number, Verse[]>;
  surahs: Surah[];
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
  showFootnotes: Record<number, boolean>;
  onToggleFootnote: (verseId: number) => void;
  t: ReturnType<typeof import('../../translations').useTranslations>;
}

export function BookLayoutContent({
  isLoading,
  loadingText,
  versesBySurah,
  surahs,
  viewType,
  fontSize,
  lineHeight,
  showFootnotes,
  onToggleFootnote,
  t,
}: BookLayoutContentProps) {
  return (
    <div className="relative p-4 sm:p-6 space-y-8 min-h-[400px]">
      <BookLayoutLoadingOverlay isLoading={isLoading} loadingText={loadingText} />

      <motion.div
        key="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full space-y-8"
      >
        {Object.entries(versesBySurah).map(([surahId, surahVerses]) => (
          <BookLayoutSurahSection
            key={surahId}
            surahId={surahId}
            surahVerses={surahVerses}
            surahs={surahs}
            viewType={viewType}
            fontSize={fontSize}
            lineHeight={lineHeight}
            showFootnotes={showFootnotes}
            onToggleFootnote={onToggleFootnote}
            t={t}
          />
        ))}
      </motion.div>
    </div>
  );
}
