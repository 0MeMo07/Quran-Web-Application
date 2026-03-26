import { type Verse, type Surah } from '../../api/types';
import { type ViewType, type LayoutType } from '../../store/slices/uiSlice';
import { BookLayoutLoadingOverlay } from './BookLayoutLoadingOverlay';
import { BookLayoutSurahSection } from './BookLayoutSurahSection';
import { FlipBookContent } from './FlipBookContent';
import { motion, AnimatePresence } from 'framer-motion';

interface BookLayoutContentProps {
  isLoading: boolean;
  loadingText: string;
  verses: Verse[];
  versesBySurah: Record<number, Verse[]>;
  surahs: Surah[];
  viewType: ViewType;
  layoutType: LayoutType;
  fontSize: number;
  lineHeight: number;
  showFootnotes: Record<number, boolean>;
  onToggleFootnote: (verseId: number) => void;
  t: ReturnType<typeof import('../../translations').useTranslations>;
}

export function BookLayoutContent({
  isLoading,
  loadingText,
  verses,
  versesBySurah,
  surahs,
  viewType,
  layoutType,
  fontSize,
  lineHeight,
  showFootnotes,
  onToggleFootnote,
  t,
}: BookLayoutContentProps) {
  return (
    <div className={`relative ${layoutType === 'flipbook' ? 'p-0 overflow-hidden h-full flex flex-col' : 'p-4 sm:p-6 space-y-8 min-h-[400px]'}`}>
      <BookLayoutLoadingOverlay isLoading={isLoading} loadingText={loadingText} />

      <AnimatePresence mode="wait">
        {layoutType === 'flipbook' ? (
          <motion.div
            key="flipbook"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex flex-col"
          >
            <FlipBookContent 
              verses={verses} 
              viewType={viewType}
              fontSize={fontSize} 
              lineHeight={lineHeight} 
              t={t}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
        )}
      </AnimatePresence>
    </div>
  );
}
