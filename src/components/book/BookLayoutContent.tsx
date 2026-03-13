import { type Verse } from '../../api/types';
import { type ViewType } from '../../store/slices/uiSlice';
import { BookLayoutLoadingOverlay } from './BookLayoutLoadingOverlay';
import { BookLayoutSurahSection } from './BookLayoutSurahSection';

interface SurahOption {
  id: number;
  name: string;
}

interface BookLayoutContentProps {
  isLoading: boolean;
  loadingText: string;
  versesBySurah: Record<number, Verse[]>;
  surahs: SurahOption[];
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
    <div className="p-3 sm:p-6 space-y-6 relative min-h-[400px]">
      <BookLayoutLoadingOverlay isLoading={isLoading} loadingText={loadingText} />

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
    </div>
  );
}
