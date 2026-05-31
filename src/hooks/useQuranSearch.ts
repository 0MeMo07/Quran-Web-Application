import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearResults, selectSearchLanguage } from '../store/slices/searchSlice';
import { setCurrentSurah, setBookCurrentSurahId, setHighlightedVerse } from '../store/slices/quranSlice';
import { useAudioPlayer } from './useAudioPlayer';
import { useTranslations } from '../translations';
import { setReadingType } from '../store/slices/uiSlice';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';
import { useLazySearchVersesQuery, useLazyGetRandomVerseQuery } from '../store/services/quranApi';

export function useQuranSearch(isOpen: boolean, onClose: () => void) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const language = useSelector(selectSearchLanguage);
  
  const [triggerSearch, { data: searchResultsData, isFetching: isSearchLoading }] = useLazySearchVersesQuery();
  const [triggerRandom, { data: randomVerseData }] = useLazyGetRandomVerseQuery();

  const searchResults = searchResultsData || [];
  const isLoading = isSearchLoading;
  const randomVerse = randomVerseData || null;

  const { isPlaying, currentAudioId, playAudio } = useAudioPlayer();
  const navigate = useNavigate();
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const [activeResultId, setActiveResultId] = useState<number | null>(null);

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
        triggerSearch({ searchTerm, language });
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, language, triggerSearch]);

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
    triggerRandom(language);
  };

  const handleAudioPlay = (audioUrl: string, id: number) => {
    playAudio(audioUrl, id);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    randomVerse,
    activeResultId,
    setActiveResultId,
    isPlaying,
    currentAudioId,
    handleVerseClick,
    handleRandomVerse,
    handleAudioPlay,
    t,
    language,
  };
}
