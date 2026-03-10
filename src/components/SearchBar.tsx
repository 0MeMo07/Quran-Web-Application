import { useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from '../translations';
import { useSelector, useDispatch } from 'react-redux';
import { selectReadingType } from '../store/slices/uiSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { setBookCurrentSurahId, setCurrentSurah } from '../store/slices/quranSlice';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchResults?: Array<{
    id: number;
    surah_id: number;
    verse_number: number;
    text: string;
  }>;
}

export function SearchBar({ searchTerm, onSearchChange, searchResults }: SearchBarProps) {
  const t = useTranslations();
  const readingType = useSelector(selectReadingType);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const dispatch = useDispatch();

  const handleVerseClick = (surahId: number, verseId: number) => {
    console.log('handleVerseClick called:', { surahId, verseId, readingType });
    
    if (readingType === 'book') {
      console.log('Book mode - navigating to:', `/surah/${surahId}`);
      dispatch(setBookCurrentSurahId(Number(surahId)));
      window.location.href = `/surah/${surahId}`;
    } else {
      const url = selectedAuthor 
        ? `/surah/${surahId}/verse/${verseId}/${selectedAuthor.id}`
        : `/surah/${surahId}/verse/${verseId}`;
      console.log('Card mode - navigating to:', url);
      dispatch(setCurrentSurah(Number(surahId)));
      window.location.href = url;
    }
  };

  useEffect(() => {
    console.log('Search term changed:', searchTerm);
    console.log('Current search results:', searchResults);
  }, [searchTerm, searchResults]);

  console.log('SearchBar rendered with results:', searchResults);

  return (
    <div className="relative max-w-2xl mx-auto mt-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.search.placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                 text-gray-900 dark:text-gray-100 transition-all duration-200
                 placeholder-gray-400 dark:placeholder-gray-500"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                   dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Arama Sonuçları */}
      {searchResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => {
                console.log('Search result clicked:', result);
                handleVerseClick(result.surah_id, result.verse_number);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Surah {result.surah_id}, Verse {result.verse_number}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {result.text}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}