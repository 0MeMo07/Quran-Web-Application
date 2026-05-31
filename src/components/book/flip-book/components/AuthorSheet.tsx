import React from 'react';
import { Drawer } from 'vaul';
import { X, Check } from 'lucide-react';
import { cn } from '../../../ui/cn';

interface AuthorSheetProps {
  open: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (language: 'tr' | 'en') => void;
  filteredAuthors: Array<{ id: number; name: string }>;
  selectedAuthorId: number | null;
  onAuthorSelect: (authorId: number | null) => void;
  showAuthorNotes: boolean;
  setShowAuthorNotes: (value: boolean | ((prev: boolean) => boolean)) => void;
  t: any;
}

export const AuthorSheet = React.memo(function AuthorSheet({
  open,
  onClose,
  language,
  onLanguageChange,
  filteredAuthors,
  selectedAuthorId,
  onAuthorSelect,
  showAuthorNotes,
  setShowAuthorNotes,
  t,
}: AuthorSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      direction="bottom"
      modal
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1190] bg-black/35" />

        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-[1200] overflow-hidden rounded-t-3xl',
            'bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-white/[0.08]',
            'shadow-[0_-20px_60px_rgba(0,0,0,0.55)]',
          )}
        >
          <Drawer.Title className="sr-only">
            {t.sidebar?.selectTranslator || 'Cevirmen Sec'}
          </Drawer.Title>

          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-white/15" />
          </div>

          <div className="px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+20px)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-white/30">
                  {t.sidebar?.selectTranslator || 'Cevirmen Sec'}
                </p>
                <p className="text-xs text-white/45 mt-1">
                  {(language || '').toUpperCase()} • {filteredAuthors.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 active:scale-90 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onLanguageChange('tr')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                  language === 'tr'
                    ? 'bg-white/16 border-white/35 text-white'
                    : 'bg-white/[0.05] border-white/[0.12] text-white/65 hover:text-white/85'
                )}
              >
                TR
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                  language === 'en'
                    ? 'bg-white/16 border-white/35 text-white'
                    : 'bg-white/[0.05] border-white/[0.12] text-white/65 hover:text-white/85'
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
                    ? 'bg-white/16 border-white/35 text-white'
                    : 'bg-white/[0.05] border-white/[0.12] text-white/65 hover:text-white/85'
                )}
              >
                {showAuthorNotes
                  ? (t.verse?.hideFootnotes || 'Notlar: Acik')
                  : (t.verse?.showFootnotes || 'Notlar: Kapali')}
              </button>
            </div>

            <div className="max-h-[48dvh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2">
              {filteredAuthors.map((author) => {
                const isSelected = selectedAuthorId === author.id;

                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => onAuthorSelect(author.id)}
                    className={cn(
                      'w-full px-3 py-2 rounded-xl text-left text-sm flex items-center justify-between transition-colors',
                      isSelected
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    )}
                  >
                    <span className="truncate">{author.name}</span>
                    {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
});
