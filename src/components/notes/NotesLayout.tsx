import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Book, Search, Calendar, BookOpen, Microscope,
  Moon, Sun, Grid3X3, List, SortAsc, SortDesc, Filter, X
} from 'lucide-react';
import { useTranslations } from '../../translations';
import { selectNotes, selectTheme, toggleTheme, setReadingType } from '../../store/slices/uiSlice';
import type { Note } from '../../store/slices/uiSlice';

type ViewMode = 'list' | 'grid';
type SortBy = 'date' | 'surah';
type SortOrder = 'asc' | 'desc';

export const NotesLayout = () => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const notes = useSelector(selectNotes);
  const theme = useSelector(selectTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('surah');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.surahName]) {
      acc[note.surahName] = [];
    }
    acc[note.surahName].push(note);
    return acc;
  }, {} as { [key: string]: Note[] });

  const filteredNotes = Object.entries(groupedNotes).reduce((acc, [surahName, notes]) => {
    let filteredSurahNotes = notes.filter(note => 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surahName.toLowerCase().includes(searchQuery.toLowerCase())
    );


    filteredSurahNotes.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === 'desc' 
          ? b.verseId - a.verseId
          : a.verseId - b.verseId;
      }
    });

    if (filteredSurahNotes.length > 0) {
      acc[surahName] = filteredSurahNotes;
    }
    return acc;
  }, {} as { [key: string]: Note[] });

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="p-2 -ml-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-semibold text-foreground">
                  {t.notes.myNotes}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  {notes.length} {t.notes.totalNotes}
                </span>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Toolbar */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t.notes.searchInNotes}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-secondary border-0 rounded-xl focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* View Controls */}
              <div className="flex items-center gap-2">
                <div className="bg-secondary rounded-lg p-1 flex items-center">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-surface text-primary shadow-sm' 
                        : 'text-foreground hover:bg-secondary/80'
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-surface text-primary shadow-sm' 
                        : 'text-foreground hover:bg-secondary/80'
                    }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  title="Sort Order"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                  title="Filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="bg-surface text-foreground rounded-lg border-0 py-2 pl-3 pr-10 focus:ring-2 focus:ring-primary"
                  >
                    <option value="date">Date</option>
                    <option value="surah">Verse Number</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {Object.keys(filteredNotes).length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-6'}>
            {Object.entries(filteredNotes).map(([surahName, notes]) => (
              <div key={surahName} className="group bg-surface rounded-2xl shadow-sm hover:shadow-md overflow-hidden border border-border transition-all duration-200">
                <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                  <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Book className="w-5 h-5 text-primary" />
                    {surahName}
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {notes.map((note) => (
                    <div key={note.id} className="p-6 hover:bg-secondary/30 transition-colors">
                      <p className="text-sm font-medium text-primary mb-1">
                        {t.verse.verse} {note.verseId}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3 mb-3">
                        {note.content}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                      {/* Navigation buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/surah/${note.surahId}`}
                          state={{ targetVerseId: note.verseId }}
                          onClick={() => dispatch(setReadingType('book') as any)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {t.notes.goToBook}
                        </Link>
                        <Link
                          to={`/surah/${note.surahId}/verse/${note.verseId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <Microscope className="w-3.5 h-3.5" />
                          {t.notes.goToDetail}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center">
              <Book className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchQuery ? t.notes.noSearchResults : t.notes.noNotes}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? t.notes.tryAnotherSearch : t.notes.startAddingNotes}
            </p>
            {!searchQuery && (
              <Link
                to="/"
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-primary-foreground bg-primary hover:opacity-90 transition-all duration-200"
              >
                {t.notes.startReading}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};