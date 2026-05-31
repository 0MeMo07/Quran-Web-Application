import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from '../../translations';
import type { VersePart } from '../../api/types';
import { WordTooltip } from './WordTooltip';

interface WordChipProps {
  part: VersePart;
  language: string;
  index: number;
}

export function WordChip({ part, language, index }: WordChipProps) {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);

  return (
    <div
      ref={anchorRef}
      className="relative flex flex-col items-center cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && <WordTooltip part={part} language={language} anchorRef={anchorRef} />}

      <div
        className={`relative w-full px-3 py-2.5 rounded-xl border transition-all duration-150 text-center min-h-[102px] ${
          hovered
            ? 'bg-primary/10 border-primary shadow-md -translate-y-0.5'
            : 'bg-secondary border-border'
        }`}
      >
        <span className="absolute top-1.5 left-1.5 text-[10px] leading-none px-1.5 py-0.5 rounded-md bg-background text-muted-foreground font-semibold tabular-nums">
          {index}
        </span>

        {/* Arabic */}
        <p
          className="text-2xl font-arabic text-foreground leading-relaxed"
          dir="rtl"
          lang="ar"
        >
          {part.arabic}
        </p>
        {/* Meaning */}
        <p className="text-xs text-muted-foreground mt-1 w-full truncate leading-tight font-medium">
          {meaning}
        </p>
        {/* Root badge */}
        {part.root ? (
          <Link
            to={`/root/${encodeURIComponent(part.root.latin)}`}
            className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title={`${t.detail.viewRoot}: ${part.root.latin}`}
          >
            <span className="font-arabic text-sm leading-tight" dir="rtl">{part.root.arabic}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5 shrink-0" />
          </Link>
        ) : (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs">
            —
          </span>
        )}
      </div>
    </div>
  );
}
