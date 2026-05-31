import { memo } from 'react';
import { BookOpen, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RootVerseItem } from '../../api/types';
import { useTranslations } from '../../translations';
import { useCopy } from '../../hooks/useCopy';
import { toReadableLabel } from '../../helpers/grammarUtils';

interface RootVerseCardProps {
  item: RootVerseItem;
  t: ReturnType<typeof useTranslations>;
  language: 'en' | 'tr';
}

export const RootVerseCard = memo(function RootVerseCard({ item, t, language }: RootVerseCardProps) {
  const { copy, copied } = useCopy();
  const props = Array.from(new Set([
    item.prop_1, item.prop_2, item.prop_3, item.prop_4,
    item.prop_5, item.prop_6, item.prop_7, item.prop_8,
  ]
    .filter(Boolean)
    .map((prop) => toReadableLabel(prop, language))
    .filter(Boolean)));

  const handleCopy = () => {
    const text = [
      `${item.surah.name} — ${t.root.verse} ${item.verse.verse_number}`,
      item.verse.verse,
      item.verse.translation?.text ?? '',
    ]
      .filter(Boolean)
      .join('\n');
    copy(text);
  };

  return (
    <article className="group bg-surface rounded-2xl shadow-sm hover:shadow-md border border-border transition-all duration-200 overflow-hidden">
      {/* ── Reference bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-border">
        <Link
          to={`/surah/${item.surah.id}/verse/${item.verse.verse_number}`}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="font-arabic text-base leading-none" lang="ar" dir="rtl">
            {item.surah.name}
          </span>
          <span className="text-primary/30">·</span>
          <span>
            {t.root.verse} {item.verse.verse_number}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {t.verse.juz} {item.verse.juz_number}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {t.verse.page} {item.verse.page}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title={t.root.copyVerse}
            aria-label={t.root.copyVerse}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <Link
            to={`/surah/${item.surah.id}/verse/${item.verse.verse_number}`}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label={t.root.verse}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 space-y-4">
        {/* Arabic verse */}
        <p
          className="text-2xl sm:text-[1.75rem] leading-loose text-foreground text-right font-arabic"
          dir="rtl"
          lang="ar"
        >
          {item.verse.verse}
        </p>

        {/* Root word in context */}
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2 shrink-0">
            {t.root.wordInContext}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
            <span
              className="text-xl font-arabic font-semibold text-foreground leading-none"
              dir="rtl"
              lang="ar"
            >
              {item.arabic}
            </span>
            {item.transcription && (
              <>
                <span className="w-px h-4 bg-primary/20 shrink-0" />
                <span className="text-xs text-muted-foreground italic">
                  {item.transcription}
                </span>
              </>
            )}
            {item.turkish && (
              <>
                <span className="w-px h-4 bg-primary/20 shrink-0" />
                <span className="text-xs text-foreground font-medium">
                  {item.turkish}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Translation text */}
        {item.verse.translation && (
          <p className="text-foreground leading-relaxed pt-2 border-t border-border/50">
            {item.verse.translation.text}
          </p>
        )}

        {/* Morphological props */}
        {props.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {props.map((prop, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg border bg-secondary/40 text-muted-foreground border-border/50"
              >
                {prop}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
});
