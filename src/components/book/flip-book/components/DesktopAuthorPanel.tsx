import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../ui/cn';

interface DesktopAuthorPanelProps {
  isAuthorPanelVisible: boolean;
  setIsAuthorPanelVisible: (visible: boolean) => void;
  language: string;
  filteredAuthors: any[];
  selectedAuthor: any;
  showAuthorNotes: boolean;
  setShowAuthorNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleAuthorLanguageChange: (language: 'tr' | 'en') => void;
  handleAuthorSelect: (authorId: number | null) => void;
  t: any;
}

export const DesktopAuthorPanel = React.memo(function DesktopAuthorPanel({
  isAuthorPanelVisible,
  setIsAuthorPanelVisible,
  language,
  filteredAuthors,
  selectedAuthor,
  showAuthorNotes,
  setShowAuthorNotes,
  handleAuthorLanguageChange,
  handleAuthorSelect,
  t,
}: DesktopAuthorPanelProps) {
  if (!isAuthorPanelVisible) return null;

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAuthorPanelVisible(false)}
        className="absolute inset-0 z-[75] cursor-default"
        aria-label="close-author-panel"
      />

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="absolute right-4 bottom-14 z-[80] w-[290px] rounded-2xl border border-border/80 bg-[hsl(var(--background))] shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border/70">
          <p className="text-xs font-semibold text-foreground">
            {t.sidebar?.selectTranslator || 'Çevirmen Seç'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {(language || '').toUpperCase()} • {filteredAuthors.length}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAuthorLanguageChange('tr')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                language === 'tr'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground'
              )}
            >
              TR
            </button>
            <button
              type="button"
              onClick={() => handleAuthorLanguageChange('en')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                language === 'en'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground'
              )}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => setShowAuthorNotes((prev) => !prev)}
              className={cn(
                'ml-auto px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                showAuthorNotes
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground'
              )}
            >
              {showAuthorNotes
                ? t.verse?.hideFootnotes || 'Notlar: Açık'
                : t.verse?.showFootnotes || 'Notlar: Kapalı'}
            </button>
          </div>
        </div>

        <div className="max-h-[36vh] overflow-y-auto p-1.5">
          {filteredAuthors.map((author) => {
            const isSelected = selectedAuthor?.id === author.id;

            return (
              <button
                key={author.id}
                type="button"
                onClick={() => handleAuthorSelect(author.id)}
                className={cn(
                  'w-full px-3 py-2 rounded-xl text-left text-sm flex items-center justify-between transition-colors',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted/50'
                )}
              >
                <span className="truncate">{author.name}</span>
                {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
});
