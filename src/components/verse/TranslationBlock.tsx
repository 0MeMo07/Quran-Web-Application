import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Verse } from '../../api/types';
import { useTranslations } from '../../translations';

interface TranslationBlockProps {
  verse: Verse;
  isPrimary?: boolean;
}

export function TranslationBlock({ verse, isPrimary = false }: TranslationBlockProps) {
  const [showFootnotes, setShowFootnotes] = useState(false);
  const t = useTranslations();

  return (
    <div className={`px-5 py-4 ${isPrimary ? 'bg-primary/5' : ''}`}>
      <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider flex items-center gap-1.5">
        {verse.translation?.author?.name}
        {verse.translation?.author?.language && (
          <span className="text-muted-foreground normal-case font-normal">
            ({verse.translation.author.language.toUpperCase()})
          </span>
        )}
        {isPrimary && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary normal-case font-medium tracking-normal">
            {t.versePage.translations}
          </span>
        )}
      </p>
      <p className="text-foreground leading-relaxed text-sm">
        {verse.translation?.text}
      </p>
      {verse.translation?.footnotes && verse.translation.footnotes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowFootnotes((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-colors"
          >
            {showFootnotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showFootnotes ? t.verse.hideFootnotes : t.verse.showFootnotes}
            <span className="text-muted-foreground">({verse.translation.footnotes.length})</span>
          </button>
          {showFootnotes && (
            <div className="mt-2 pl-3 border-l-2 border-primary/30 space-y-1.5">
              {verse.translation.footnotes.map((fn) => (
                <p key={fn.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">[{fn.number}]</span>{' '}
                  {fn.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
