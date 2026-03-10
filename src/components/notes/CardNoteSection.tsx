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
        <div className="mt-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                {existingNote.content}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t.notes.savedAt}: {new Date(existingNote.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditClick(existingNote.content)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDeleteClick}
                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onay modalı */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.notes.delete}?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.notes.deleteConfirmation}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t.notes.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
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