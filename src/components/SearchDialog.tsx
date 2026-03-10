import { useState, useEffect } from 'react';
import { Search, X, Loader2, Book, Shuffle, Volume2, Pause } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import {
  searchVerses,
  fetchRandomVerse,
  clearResults,
  selectSearchResults,
  selectSearchLoading,
  selectSearchLanguage,
  selectRandomVerse,
} from '../store/slices/searchSlice';
import { setCurrentSurah, setBookCurrentSurahId } from '../store/slices/quranSlice';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useTranslations } from '../translations';
import { useNavigate } from 'react-router-dom';
import { selectReadingType } from '../store/slices/uiSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { HighlightedText } from '../helpers/HighlightedText';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const searchResults = useSelector(selectSearchResults);
  const isLoading = useSelector(selectSearchLoading);
  const language = useSelector(selectSearchLanguage);
  const randomVerse = useSelector(selectRandomVerse);
  const { isPlaying, currentAudioId, playAudio } = useAudioPlayer();
  const navigate = useNavigate();
  const readingType = useSelector(selectReadingType);
  const selectedAuthor = useSelector(selectSelectedAuthor);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      dispatch(clearResults());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        dispatch(searchVerses({ searchTerm, language }) as any);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, language, dispatch]);

  const handleVerseClick = (surahId: number, verseNumber: number) => {
    if (readingType === 'book') {
      dispatch(setBookCurrentSurahId(surahId));
      
      onClose();

      setTimeout(() => {
        navigate(`/surah/${surahId}/verse/${verseNumber}`);
        
        setTimeout(() => {
          const verseElement = document.querySelector(`[data-verse-id="${verseNumber}"][data-surah-id="${surahId}"]`);
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 500);
      }, 100);
    } else {
      dispatch(setCurrentSurah(surahId));
      const url = selectedAuthor 
        ? `/surah/${surahId}/verse/${verseNumber}/${selectedAuthor.id}`
        : `/surah/${surahId}/verse/${verseNumber}`;
      
      onClose();
      navigate(url);

      setTimeout(() => {
        const verseElement = document.querySelector(`[data-verse-id="${verseNumber}"]`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
          setTimeout(() => {
            verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
          }, 2000);
        }
      }, 500);
    }
  };

  const handleRandomVerse = () => {
    dispatch(fetchRandomVerse(language) as any);
  };

  const handleAudioPlay = (audioUrl: string, id: number) => {
    playAudio(audioUrl, id);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Arka plan overlay */}
      <div 
        className="fixed inset-0 z-[79] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search dialog */}
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-4 sm:pt-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 h-[90vh] max-h-[800px] flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              autoFocus
            />
                {searchTerm && (
              <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50"
              >
                    <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
          </div>
        </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.loading}</p>
                </div>
            </div>
          ) : searchTerm.length < 2 && !randomVerse ? (
              <div className="p-8 text-center h-full flex items-center justify-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400">{t.search.minChars}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {t.search.searchTip}
                    </p>
                  </div>
                </div>
            </div>
          ) : searchResults.length === 0 && !randomVerse ? (
              <div className="p-8 text-center h-full flex items-center justify-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <Book className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t.search.noResults} "<span className="font-medium">{searchTerm}</span>"
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {t.search.tryDifferent}
                    </p>
                  </div>
                </div>
            </div>
          ) : (
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {/* Random Verse Card */}
              {randomVerse && !searchTerm && (
                  <div 
                    className="group p-4 sm:p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    onClick={() => handleVerseClick(randomVerse.surah.id, randomVerse.verse.verse_number)}
                  >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl flex-shrink-0">
                      <Shuffle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {randomVerse.surah.name_en} ({randomVerse.surah.name})
                        </h3>
                        <div className="flex items-center gap-2">
                          {randomVerse.surah.audio && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAudioPlay(
                                language === 'en' ? randomVerse.surah.audio!.mp3_en : randomVerse.surah.audio!.mp3,
                                randomVerse.verse.id
                                  );
                                }}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              {isPlaying && currentAudioId === randomVerse.verse.id ? (
                                <Pause className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t.verse.verse} {randomVerse.verse.verse_number}
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl leading-relaxed text-right font-arabic" dir="rtl">
                        {randomVerse.verse.verse}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {language === 'en' ? randomVerse.verse.transcription_en : randomVerse.verse.transcription}
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {randomVerse.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

                {/* Search Results */}
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleVerseClick(result.surah.id, result.verse.verse_number)}
                    className="w-full p-4 sm:p-6 text-left group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl flex-shrink-0">
                      <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {result.surah.name_en} ({result.surah.name})
                        </h3>
                        <div className="flex items-center gap-2">
                          {result.surah.audio && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAudioPlay(
                                  language === 'en' ? result.surah.audio!.mp3_en : result.surah.audio!.mp3,
                                  result.verse.id
                                );
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              {isPlaying && currentAudioId === result.verse.id ? (
                                <Pause className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Verse {result.verse.verse_number}
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl leading-relaxed text-right font-arabic" dir="rtl">
                        {result.verse.verse}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {language === 'en' ? result.verse.transcription_en : result.verse.transcription}
                      </p>
                        <p className="text-gray-900 dark:text-gray-100">
                          {result._formatted ? (
                            <HighlightedText text={result._formatted.text} />
                          ) : (
                            <HighlightedText text={result.text} />
                          )}
                        </p>
                      </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <button
              onClick={handleRandomVerse}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors"
            >
              <Shuffle className="w-5 h-5" />
              <span className="text-sm font-medium">{t.search.random}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}