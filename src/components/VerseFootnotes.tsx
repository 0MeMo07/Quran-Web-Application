import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Footnote {
  id: number;
  number: number;
  text: string;
}

interface VerseFootnotesProps {
  footnotes: Footnote[];
  t: {
    verse: {
      showFootnotes: string;
      hideFootnotes: string;
    };
  };
}

export function VerseFootnotes({ footnotes, t }: VerseFootnotesProps) {
  const [showTranslations, setShowTranslations] = useState(false);

  if (!footnotes || footnotes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={() => setShowTranslations(!showTranslations)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <span>{showTranslations ? t.verse.hideFootnotes : t.verse.showFootnotes}</span>
        {showTranslations ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {showTranslations && (
        <div className="pl-4 border-l-2 border-border/50 space-y-2">
          {footnotes.map((footnote) => (
            <p key={footnote.id} className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">
                [{footnote.number}]
              </span>{' '}
              {footnote.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
