import React from 'react';

interface DeleteNotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: {
    notes: {
      delete: string;
      cancel: string;
      deleteConfirmation: string;
    };
  };
}

export const DeleteNotePopup: React.FC<DeleteNotePopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.notes.delete}?
          </h3>
          <p className="text-muted-foreground mb-6">
            {t.notes.deleteConfirmation}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              {t.notes.cancel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              {t.notes.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 