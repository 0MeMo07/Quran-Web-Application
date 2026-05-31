import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from '../../translations';
import type { VersePart } from '../../api/types';

interface WordTooltipProps {
  part: VersePart;
  language: string;
  anchorRef: React.RefObject<HTMLDivElement>;
}

export function WordTooltip({ part, language, anchorRef }: WordTooltipProps) {
  const t = useTranslations();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const meaning = language === 'en'
    ? (part.translation_en || part.translation_tr)
    : (part.translation_tr || part.translation_en);
  const transcription = language === 'en'
    ? (part.transcription_en || part.transcription_tr)
    : (part.transcription_tr || part.transcription_en);

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY - 8,   // 8px gap above anchor
        left: r.left + r.width / 2,
      });
    }
  }, [anchorRef]);

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        width: '15rem',
      }}
    >
      <div className="bg-surface text-foreground rounded-2xl shadow-2xl p-4 border border-border text-sm">
        {/* Arabic word */}
        <p className="text-2xl font-arabic text-right mb-1 text-primary leading-relaxed" dir="rtl" lang="ar">
          {part.arabic}
        </p>
        {/* Transcription */}
        {transcription && (
          <p className="text-muted-foreground italic text-xs mb-2">{transcription}</p>
        )}
        {/* Meaning */}
        <p className="text-foreground font-medium mb-2 leading-snug">{meaning}</p>
        {/* Root */}
        {part.root ? (
          <div className="border-t border-border pt-2 flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">{t.detail.root}:</span>
            <span className="flex items-center gap-1">
              <span className="text-primary font-arabic text-lg leading-normal" dir="rtl">{part.root.arabic}</span>
              <span className="text-muted-foreground text-xs font-mono">({part.root.latin})</span>
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs border-t border-border pt-2">{t.detail.noRoot}</p>
        )}
      </div>
      {/* Arrow */}
      <div className="w-3 h-3 bg-surface border-r border-b border-border rotate-45 mx-auto -mt-1.5" />
    </div>,
    document.body,
  );
}
