import { useState, useEffect } from 'react';
import { Search, X, Loader2, Book, Shuffle, Volume2, Pause } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
      document.body.style.overflow = 'unset';
    } else {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
            verseElement.classList.add('bg-accent/10');
            setTimeout(() => {
              verseElement.classList.remove('bg-accent/10');
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
          verseElement.classList.add('bg-accent/10');
          setTimeout(() => {
            verseElement.classList.remove('bg-accent/10');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[79] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Search dialog */}
          <div className="fixed inset-0 z-[80] flex items-start justify-center pt-4 sm:pt-16 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl mx-4 h-[90vh] max-h-[800px] flex flex-col overflow-hidden border border-border pointer-events-auto"
            >
              {/* Header */}
              <div className="p-4 border-b border-border bg-surface/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t.search.placeholder}
                      className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all duration-200"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground animate-pulse">{t.loading}</p>
                    </div>
                  </div>
                ) : searchTerm.length < 2 && !randomVerse ? (
                  <div className="p-8 text-center h-full flex items-center justify-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-foreground font-medium">{t.search.minChars}</p>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed text-center">
                          {t.search.searchTip}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (searchResults.length === 0 && searchTerm.length >= 2 && !randomVerse) ? (
                  <div className="p-8 text-center h-full flex items-center justify-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
                        <Book className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-foreground font-medium">
                          {t.search.noResults} "<span className="text-primary font-bold">{searchTerm}</span>"
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          {t.search.tryDifferent}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border/10">
                    {/* Random Verse Card */}
                    {randomVerse && !searchTerm && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group p-4 sm:p-6 cursor-pointer hover:bg-secondary/30 transition-all duration-300"
                        onClick={() => handleVerseClick(randomVerse.surah.id, randomVerse.verse.verse_number)}
                      >
                        <div className="flex items-start gap-5">
                          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3.5 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Shuffle className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                                {randomVerse.surah.name_en} ({randomVerse.surah.name})
                              </h3>
                              <div className="flex items-center gap-3">
                                {randomVerse.surah.audio && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAudioPlay(
                                        language === 'en' ? randomVerse.surah.audio!.mp3_en : randomVerse.surah.audio!.mp3,
                                        randomVerse.verse.id
                                      );
                                    }}
                                    className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                                  >
                                    {isPlaying && currentAudioId === randomVerse.verse.id ? (
                                      <Pause className="w-5 h-5 text-accent" />
                                    ) : (
                                      <Volume2 className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-lg text-muted-foreground">
                                  {t.verse.verse} {randomVerse.verse.verse_number}
                                </span>
                              </div>
                            </div>
                            <p className="text-3xl leading-loose text-right font-arabic" dir="rtl">
                              {randomVerse.verse.verse}
                            </p>
                            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4 py-1">
                              {language === 'en' ? randomVerse.verse.transcription_en : randomVerse.verse.transcription}
                            </p>
                            <p className="text-foreground leading-relaxed">
                              {randomVerse.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Search Results */}
                    {searchResults.map((result, idx) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                        onClick={() => handleVerseClick(result.surah.id, result.verse.verse_number)}
                        className="w-full p-4 sm:p-6 text-left group hover:bg-secondary/30 transition-all duration-300"
                      >
                        <div className="flex items-start gap-5">
                          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3.5 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Book className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                                {result.surah.name_en} <span className="text-muted-foreground/30 mx-1">{result.surah.name}</span>
                              </h3>
                              <div className="flex items-center gap-3">
                                {result.surah.audio && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAudioPlay(
                                        language === 'en' ? result.surah.audio!.mp3_en : result.surah.audio!.mp3,
                                        result.verse.id
                                      );
                                    }}
                                    className="p-2.5 rounded-2xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                                  >
                                    {isPlaying && currentAudioId === result.verse.id ? (
                                      <Pause className="w-5 h-5 text-primary" />
                                    ) : (
                                      <Volume2 className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                                <span className="text-xs font-numbers font-bold px-3 py-1 bg-secondary rounded-full text-muted-foreground/60 tracking-wider">
                                  {result.verse.verse_number}
                                </span>
                              </div>
                            </div>
                            <p className="text-4xl leading-[1.8] text-right font-arabic text-foreground" dir="rtl">
                              {result.verse.verse}
                            </p>
                            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4 py-1">
                              {language === 'en' ? result.verse.transcription_en : result.verse.transcription}
                            </p>
                            <div className="text-foreground leading-relaxed">
                              {result._formatted ? (
                                <HighlightedText text={result._formatted.text} />
                              ) : (
                                <HighlightedText text={result.text} />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface/90 backdrop-blur-sm">
                <button
                  onClick={handleRandomVerse}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-[0.98] font-medium"
                >
                  <Shuffle className="w-5 h-5" />
                  <span className="text-sm">{t.search.random}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
