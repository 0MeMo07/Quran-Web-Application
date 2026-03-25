import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNote, selectNotes } from '../../store/slices/uiSlice';

interface CardNoteSectionProps {
  verseId: number;
  surahId: number;
  onDeleteClick: () => void;
  onEditClick: (content: string) => void;
  t: {
    notes: {
      addNote: string;
      editNote: string;
      placeholder: string;
      save: string;
      cancel: string;
      delete: string;
      noNotes: string;
      savedAt: string;
      deleteConfirmation: string;
    };
  };
}

export const CardNoteSection: React.FC<CardNoteSectionProps> = ({ verseId, surahId, onDeleteClick, onEditClick, t }) => {
  const dispatch = useDispatch();
  const notes = useSelector(selectNotes);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Notu hem sure hem de ayet ID'sine göre bul
  const existingNote = notes.find(
    note => note.surahId === surahId && note.verseId === verseId
  );

  const handleDelete = () => {
    dispatch(deleteNote({ surahId, verseId }));
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="mt-4">
      {existingNote && (
        <div className="mt-4 bg-secondary/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-foreground text-sm whitespace-pre-wrap">
                {existingNote.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.notes.savedAt}: {new Date(existingNote.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditClick(existingNote.content)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDeleteClick}
                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onay modalı */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t.notes.delete}?
            </h3>
            <p className="text-muted-foreground mb-6">
              {t.notes.deleteConfirmation}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                {t.notes.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-lg"
              >
                {t.notes.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 