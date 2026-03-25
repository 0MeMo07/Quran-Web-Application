import { ChevronDown, ChevronUp } from 'lucide-react';
import { type Verse } from '../../api/types';
import { type ViewType } from '../../store/slices/uiSlice';
import { NoteSection } from '../notes/BookNoteSection';

interface BookLayoutVerseItemProps {
  verse: Verse;
  viewType: ViewType;
  fontSize: number;
  lineHeight: number;
  showFootnotes: Record<number, boolean>;
  onToggleFootnote: (verseId: number) => void;
  t: ReturnType<typeof import('../../translations').useTranslations>;
}

export function BookLayoutVerseItem({
  verse,
  viewType,
  fontSize,
  lineHeight,
  showFootnotes,
  onToggleFootnote,
  t,
}: BookLayoutVerseItemProps) {
  return (
    <div
      data-verse-id={verse.verse_number}
      data-surah-id={verse.surah_id}
      className="relative group"
    >
      {(viewType === 'kuran' || viewType === 'kuran+meal') && (
        <div className={viewType === 'kuran' ? 'inline break-words' : 'mb-6 sm:mb-4'}>
          <span
            className={`
              font-scheherazade text-foreground select-text tracking-wide
              ${viewType === 'kuran'
                ? 'text-4xl mx-1 inline break-words'
                : 'text-3xl block text-right'
              }
            `}
            style={{
              wordSpacing: '0.1em',
              fontSize: `${fontSize * 2}px`,
            }}
          >
            {verse.verse}
            {viewType === 'kuran' && (
              <span
                className="inline-block mx-2 text-muted-foreground align-middle font-numbers font-medium opacity-60"
                style={{ fontSize: `${fontSize * 0.8}px` }}
              >
                {verse.verse_number}
              </span>
            )}
          </span>
        </div>
      )}

      {(viewType === 'meal' || viewType === 'meal+kuran' || viewType === 'kuran+meal') && (
        <div className={`${viewType !== 'meal' ? 'border-t border-border mt-6 sm:mt-4 pt-4 sm:pt-4' : ''}`}>
          <p className="text-foreground">
            <span
              className="text-foreground"
              style={{ fontSize: `${fontSize}px`, lineHeight }}
            >
              {verse.translation?.text}{' '}
            </span>
            <span
              className="text-primary/60 font-numbers font-bold ml-1 align-baseline inline-block scale-90"
              style={{ fontSize: `${fontSize * 0.8}px`, lineHeight }}
            >
              • {verse.verse_number}
            </span>
          </p>
        </div>
      )}

      {viewType !== 'kuran' && (verse.translation?.footnotes?.length ?? 0) > 0 && (
        <div className={`${viewType === 'meal' ? 'mt-2' : 'mt-3'}`}>
          <button
            onClick={() => onToggleFootnote(verse.id)}
            className="text-primary hover:underline text-sm flex items-center gap-2"
          >
            <span style={{ fontSize: `${fontSize * 0.75}px` }}>
              {showFootnotes[verse.id] ? t.verse.hideFootnotes : t.verse.showFootnotes}
            </span>
            {showFootnotes[verse.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFootnotes[verse.id] && (
            <div className="mt-2 pl-4 border-l-2 border-primary/20 space-y-2">
              {verse.translation?.footnotes?.map((footnote) => (
                <p
                  key={footnote.id}
                  className="text-muted-foreground italic"
                  style={{ fontSize: `${fontSize * 0.8}px`, lineHeight }}
                >
                  <span className="font-medium text-primary">
                    [{footnote.number}]
                  </span>{' '}
                  {footnote.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <NoteSection
        verseId={verse.verse_number}
        surahId={verse.surah_id}
        t={t}
        fontSize={fontSize}
        lineHeight={lineHeight}
        verseText={verse.translation?.text}
        verseNumber={verse.verse_number}
      />
    </div>
  );
}
