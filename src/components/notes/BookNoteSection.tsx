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
            className="p-2 rounded-lg bg-surface text-foreground hover:bg-secondary transition-colors shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>

      {existingNote && (
        <div className="mt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-primary hover:underline text-sm flex items-center gap-2"
            style={{ fontSize: `${fontSize * 0.75}px` }}
          >
            <span>Notes</span>
            {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showNotes && (
            <div className="mt-1 pl-4 border-l-2 border-primary/20">
              <div className="bg-secondary/20 rounded-lg p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span 
                        className="text-primary"
                        style={{ fontSize: `${fontSize * 0.7}px` }}
                      >
                        {existingNote.surahName} {t.verse.verse} {verseNumber}
                      </span>
                    </div>
                    <p 
                      className="text-foreground whitespace-pre-wrap"
                      style={{ 
                        fontSize: `${fontSize * 0.8}px`,
                        lineHeight: lineHeight 
                      }}
                    >
                      {existingNote.content}
                    </p>
                    <p 
                      className="text-muted-foreground mt-1"
                      style={{ fontSize: `${fontSize * 0.7}px` }}
                    >
                      {t.notes.savedAt}: {new Date(existingNote.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
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
          <div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {existingNote ? t.notes.editNote : t.notes.addNote}
                </h3>
                <button
                  onClick={() => setShowNotePopup(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {t.verse.verse} {verseNumber}
                </p>
                <p className="text-foreground text-sm border-l-2 border-primary pl-3 py-2">
                  {verseText}
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={t.notes.placeholder}
                  className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground placeholder-muted-foreground resize-none min-h-[150px]"
                  autoFocus
                />
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowNotePopup(false);
                      setNoteContent('');
                    }}
                    className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>{t.notes.cancel}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
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