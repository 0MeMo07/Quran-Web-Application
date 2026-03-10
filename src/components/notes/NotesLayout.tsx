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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t.notes.myNotes}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
                  {notes.length} {t.notes.totalNotes}
                </span>
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Toolbar */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.notes.searchInNotes}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* View Controls */}
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex items-center">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Sort Order"
                >
                  {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg border-0 py-2 pl-3 pr-10 focus:ring-2 focus:ring-emerald-500"
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
              <div key={surahName} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    {surahName}
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notes.map((note) => (
                    <div key={note.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        {t.verse.verse} {note.verseId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3 mb-3">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5 mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                      {/* Navigation buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/surah/${note.surahId}`}
                          state={{ targetVerseId: note.verseId }}
                          onClick={() => dispatch(setReadingType('book') as any)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {t.notes.goToBook}
                        </Link>
                        <Link
                          to={`/surah/${note.surahId}/verse/${note.verseId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
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
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Book className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery ? t.notes.noSearchResults : t.notes.noNotes}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery ? t.notes.tryAnotherSearch : t.notes.startAddingNotes}
            </p>
            {!searchQuery && (
              <Link
                to="/"
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
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