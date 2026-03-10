import React, { useState } from 'react';
import { Pencil, Save, X, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addNote, deleteNote, selectNotes, Note } from '../../store/slices/uiSlice';
import { selectSurahs } from '../../store/slices/quranSlice';

interface NoteSectionProps {
  verseId: number;
  surahId: number;
  fontSize?: number;
  lineHeight?: number;
  verseText?: string;
  verseNumber?: number;
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
    verse: {
      verse: string;
    };
  };
}

export const NoteSection: React.FC<NoteSectionProps> = ({ 
  verseId, 
  surahId, 
  t,
  fontSize = 16,
  lineHeight = 1.5,
  verseText = '',
  verseNumber
}) => {
  const dispatch = useDispatch();
  const notes = useSelector(selectNotes);
  const surahs = useSelector(selectSurahs);
  const [noteContent, setNoteContent] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  
  // Notu hem sure hem de ayet ID'sine göre bul
  const existingNote = notes.find(
    note => note.surahId === surahId && note.verseId === verseId
  );
  
  const surahName = surahs.find(s => s.id === surahId)?.name || '';

  const handleSave = () => {
    if (noteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        verseId,
        surahId,
        surahName,
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
      };
      dispatch(addNote(newNote));
      setShowNotePopup(false);
      setNoteContent('');
    }
  };

  const handleDelete = () => {
    dispatch(deleteNote({ surahId, verseId }));
    setNoteContent('');
    setShowDeleteConfirmation(false);
  };

  const handleEdit = () => {
    if (existingNote) {
      setNoteContent(existingNote.content);
      setShowNotePopup(true);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute right-0 bottom-full opacity-0 group-hover:opacity-100 transition-opacity z-40">
        {!existingNote && (
          <button
            onClick={() => setShowNotePopup(true)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>

      {existingNote && (
        <div className="mt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm flex items-center gap-2"
            style={{ fontSize: `${fontSize * 0.75}px` }}
          >
            <span>Notes</span>
            {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showNotes && (
            <div className="mt-1 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800">
              <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span 
                        className="text-emerald-600 dark:text-emerald-400"
                        style={{ fontSize: `${fontSize * 0.7}px` }}
                      >
                        {existingNote.surahName} {t.verse.verse} {verseNumber}
                      </span>
                    </div>
                    <p 
                      className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      style={{ 
                        fontSize: `${fontSize * 0.8}px`,
                        lineHeight: lineHeight 
                      }}
                    >
                      {existingNote.content}
                    </p>
                    <p 
                      className="text-gray-500 dark:text-gray-400 mt-1"
                      style={{ fontSize: `${fontSize * 0.7}px` }}
                    >
                      {t.notes.savedAt}: {new Date(existingNote.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showNotePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {existingNote ? t.notes.editNote : t.notes.addNote}
                </h3>
                <button
                  onClick={() => setShowNotePopup(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t.verse.verse} {verseNumber}
                </p>
                <p className="text-gray-900 dark:text-gray-100 text-sm border-l-2 border-emerald-500 pl-3 py-2">
                  {verseText}
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={t.notes.placeholder}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[150px]"
                  autoFocus
                />
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowNotePopup(false);
                      setNoteContent('');
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>{t.notes.cancel}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.notes.save}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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