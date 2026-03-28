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
import { setCurrentSurah, setBookCurrentSurahId, setHighlightedVerse } from '../store/slices/quranSlice';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useTranslations } from '../translations';
import { useNavigate } from 'react-router-dom';
import { setReadingType } from '../store/slices/uiSlice';
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

  const [activeResultId, setActiveResultId] = useState<number | null>(null);

  const handleVerseClick = (result: any, mode: 'book' | 'detail' = 'book') => {
    const surahId = result.surah.id;
    const verseNumber = result.verse.verse_number;
    const pageNumber = result.verse.page;

    if (mode === 'book') {
      dispatch(setReadingType('book'));
      dispatch(setBookCurrentSurahId(surahId));
      dispatch(setHighlightedVerse({ surahId, verseNumber }));
      
      onClose();
      navigate(`/surah/${surahId}/page/${pageNumber}`, { 
        state: { targetVerseId: verseNumber } 
      });
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        dispatch(setHighlightedVerse(null));
      }, 5000);
    } else {
      dispatch(setReadingType('card'));
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
            className="fixed inset-0 z-[1999] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Search dialog */}
          <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-4 sm:pt-16 pointer-events-none">
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
                        onClick={() => setActiveResultId(randomVerse.verse.id)}
                      >
                        <div className="flex items-start gap-5 relative">
                          {activeResultId === randomVerse.verse.id && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-4 border border-primary/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] px-4">
                                <button
                                  onClick={() => handleVerseClick(randomVerse, 'book')}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                  <Book className="w-4 h-4" />
                                  {t.search.goToBook}
                                </button>
                                <button
                                  onClick={() => handleVerseClick(randomVerse, 'detail')}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 active:scale-95 transition-all border border-border"
                                >
                                  <Search className="w-4 h-4" />
                                  {t.search.goToDetail}
                                </button>
                              </div>
                              <button 
                                onClick={() => setActiveResultId(null)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium underline underline-offset-4"
                              >
                                {t.header.close}
                              </button>
                            </motion.div>
                          )}
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
                        onClick={() => setActiveResultId(result.id)}
                        className="w-full p-4 sm:p-6 text-left group hover:bg-secondary/30 transition-all duration-300 relative"
                      >
                        <div className="flex items-start gap-5">
                          {activeResultId === result.id && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[320px] px-6">
                                <button
                                  onClick={() => handleVerseClick(result, 'book')}
                                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20"
                                >
                                  <Book className="w-5 h-5" />
                                  {t.search.goToBook}
                                </button>
                                <button
                                  onClick={() => handleVerseClick(result, 'detail')}
                                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 active:scale-95 transition-all border border-border"
                                >
                                  <Search className="w-5 h-5" />
                                  {t.search.goToDetail}
                                </button>
                              </div>
                              <button 
                                onClick={() => setActiveResultId(null)}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hover:underline underline-offset-4"
                              >
                                {t.header.close}
                              </button>
                            </motion.div>
                          )}
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
