import { type Verse } from '../../../api/types';
import { type ViewType } from '../../../store/slices/uiSlice';
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
  t: ReturnType<typeof import('../../../translations').useTranslations>;
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
      <div className="flex flex-col items-center justify-center mb-10 mt-6 relative">
        <h2 className="text-center font-serif text-3xl sm:text-5xl tracking-tight text-foreground">
          {surahs.find((s) => s.id === Number(surahId))?.name}
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
