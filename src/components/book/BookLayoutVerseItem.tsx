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
        <div className={viewType === 'kuran' ? 'inline break-words' : 'mb-4'}>
          <span
            className={`
              font-scheherazade text-gray-800 dark:text-gray-200 select-text tracking-wide
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
                className="inline-block mx-1 text-gray-500 dark:text-gray-400 align-middle"
                style={{ fontSize: `${fontSize}px` }}
              >
                ﴿{verse.verse_number}﴾
              </span>
            )}
          </span>
        </div>
      )}

      {(viewType === 'meal' || viewType === 'meal+kuran' || viewType === 'kuran+meal') && (
        <div className={`${viewType !== 'meal' ? 'border-t dark:border-gray-700 pt-4' : ''}`}>
          <p className="text-gray-800 dark:text-gray-200">
            <span
              className="text-gray-700 dark:text-gray-300"
              style={{ fontSize: `${fontSize}px`, lineHeight }}
            >
              {verse.translation?.text}{' '}
            </span>
            <span
              className="text-gray-600 dark:text-gray-400 font-bold"
              style={{ fontSize: `${fontSize * 0.9}px`, lineHeight }}
            >
              ﴾{verse.verse_number}﴿
            </span>
          </p>
        </div>
      )}

      {viewType !== 'kuran' && (verse.translation?.footnotes?.length ?? 0) > 0 && (
        <div className={`${viewType === 'meal' ? 'mt-2' : 'mt-3'}`}>
          <button
            onClick={() => onToggleFootnote(verse.id)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm flex items-center gap-2"
          >
            <span style={{ fontSize: `${fontSize * 0.75}px` }}>
              {showFootnotes[verse.id] ? t.verse.hideFootnotes : t.verse.showFootnotes}
            </span>
            {showFootnotes[verse.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFootnotes[verse.id] && (
            <div className="mt-2 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-2">
              {verse.translation?.footnotes?.map((footnote) => (
                <p
                  key={footnote.id}
                  className="text-gray-600 dark:text-gray-400 italic"
                  style={{ fontSize: `${fontSize * 0.8}px`, lineHeight }}
                >
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
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
