import React, { useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content: string;
  onChange: (content: string) => void;
  verseNumber: number;
  verseText?: string;
  isEditing: boolean;
  t: {
    notes: {
      addNote: string;
      editNote: string;
      placeholder: string;
      save: string;
      cancel: string;
      confirmDelete?: string;
    };
    verse: {
      verse: string;
    };
  };
}

export const NotePopup: React.FC<NotePopupProps> = ({
  isOpen,
  onClose,
  onSave,
  content,
  onChange,
  verseNumber,
  verseText,
  isEditing,
  t
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-border"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {isEditing ? t.notes.editNote : t.notes.addNote}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {t.verse.verse} {verseNumber}
                </p>
                {verseText && (
                  <p className="text-foreground text-sm border-l-2 border-primary pl-3 py-2 italic bg-secondary/30 rounded-r-lg">
                    {verseText}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={t.notes.placeholder}
                  className="w-full px-4 py-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-muted-foreground resize-none min-h-[150px] transition-all hover:bg-secondary/70"
                  autoFocus
                />
                
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>{t.notes.cancel}</span>
                  </button>
                  <button
                    onClick={onSave}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.notes.save}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
 