import { Link } from 'react-router-dom';
import type { VersePart } from '../../api/types';

interface WordRowProps {
  part: VersePart;
  index: number;
  language: string;
}

export function WordRow({ part, index, language }: WordRowProps) {
  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);
  const transcription = language === 'en'
    ? (part.transcription_en || part.transcription_tr)
    : (part.transcription_tr || part.transcription_en);

  return (
    <tr className="hover:bg-primary/5 transition-colors group border-b border-border last:border-0">
      {/* Index */}
      <td className="py-3 px-3 text-center align-middle w-8">
        <span className="text-xs text-muted-foreground tabular-nums font-mono">{index}</span>
      </td>
      {/* Arabic word + transcription */}
      <td className="py-3 px-3 text-right align-middle" dir="rtl">
        <p className="text-xl font-arabic text-foreground group-hover:text-primary transition-colors leading-relaxed">{part.arabic}</p>
        {transcription && (
          <p className="text-xs text-muted-foreground italic mt-0.5" dir="ltr">{transcription}</p>
        )}
      </td>
      {/* Meaning */}
      <td className="py-3 px-3 align-middle">
        <span className="text-sm text-foreground leading-snug">{meaning}</span>
      </td>
      {/* Root */}
      <td className="py-3 px-3 text-center align-middle">
        {part.root ? (
          <Link
            to={`/root/${encodeURIComponent(part.root.latin)}`}
            className="inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
            title={part.root.latin}
          >
            <span className="font-arabic text-base leading-tight" dir="rtl">{part.root.arabic}</span>
            <span className="text-xs font-mono text-primary/80 leading-none">{part.root.latin}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground/30 text-sm">—</span>
        )}
      </td>
    </tr>
  );
}
