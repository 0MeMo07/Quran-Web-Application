import { type Verse } from '../../api/types';
import { type ViewType } from '../../store/slices/uiSlice';
import { BookLayoutVerseItem } from './BookLayoutVerseItem';

interface SurahOption {
  id: number;
  name: string;
}

interface BookLayoutSurahSectionProps {
  surahId: string;
  surahVerses: Verse[];
  surahs: SurahOption[];
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
  showFootnotes: Record<number, boolean>;
  onToggleFootnote: (verseId: number) => void;
  t: ReturnType<typeof import('../../translations').useTranslations>;
}

export function BookLayoutSurahSection({
  surahId,
  surahVerses,
  surahs,
  viewType,
  fontSize,
  lineHeight,
  showFootnotes,
  onToggleFootnote,
  t,
}: BookLayoutSurahSectionProps) {
  return (
    <div data-surah-id={surahId}>
      <div className="flex items-center justify-center mb-6 relative">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        <h2 className="relative px-6 py-2 bg-white dark:bg-gray-800 text-lg sm:text-xl font-semibold">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            {surahs.find((s) => s.id === Number(surahId))?.name}
          </span>
        </h2>
      </div>

      <div
        className={`
          ${viewType === 'kuran'
            ? 'rtl text-right px-8 py-6 leading-[3] max-w-4xl mx-auto whitespace-normal'
            : 'space-y-4'
          }
        `}
        dir={viewType === 'kuran' ? 'rtl' : 'ltr'}
      >
        {surahVerses.map((verse) => (
          <BookLayoutVerseItem
            key={verse.id}
            verse={verse}
            viewType={viewType}
            fontSize={fontSize}
            lineHeight={lineHeight}
            showFootnotes={showFootnotes}
            onToggleFootnote={onToggleFootnote}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
