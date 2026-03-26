import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, PlayCircle, PauseCircle, Search, ArrowRight, Loader2, X } from 'lucide-react';
import { selectSurahs, setCurrentSurah, selectCurrentSurah, selectBookCurrentSurahId, setBookCurrentSurahId } from '../store/slices/quranSlice';
import { selectAuthors, selectSelectedAuthor, setSelectedAuthor } from '../store/slices/translationsSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { useTranslations } from '../translations';
import { selectReadingType } from '../store/slices/uiSlice';
import { ReadingTypeSelector } from "./ReadingTypeSelector";
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRootByLatin } from '../api/quranApi';
import type { RootDetail } from '../api/types';

export function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const readingType = useSelector(selectReadingType);
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);
  const currentSurah = useSelector(selectCurrentSurah);
  const authors = useSelector(selectAuthors);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const { surahId, verseId, authorId } = useParams();

  const selectedSurah = readingType === 'book' 
    ? surahs.find((surah) => surah.id === currentSurahId)
    : surahs.find((surah) => surah.id === currentSurah);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rootInput, setRootInput] = useState('');
  const [rootPreview, setRootPreview] = useState<RootDetail | null>(null);
  const [rootLoading, setRootLoading] = useState(false);
  const rootDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    setCurrentTime(0); 
    setDuration(0); 
    setProgress(0);
  }, [language, selectedSurah]);

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (!audioElement) return;  
  
    const updateProgress = () => {
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        setProgress(progressPercent);
        setCurrentTime(audioElement.currentTime);
        setDuration(audioElement.duration);
      }
    };
  
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
  

    const handleLoadedMetadata = () => {
      if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration > 0) {
        setDuration(audioElement.duration);
      }
    };

    const handleCanPlay = () => {
      if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration > 0) {
        setDuration(audioElement.duration);
      }
    };

    // Check if duration is already available
    if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration > 0) {
      setDuration(audioElement.duration);
    }
  
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);
  
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.removeEventListener('canplay', handleCanPlay);
        audioElement.removeEventListener('timeupdate', updateProgress);
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [selectedSurah, language]);

  useEffect(() => {
    if (readingType === 'card') {
      if (surahId) {
        dispatch(setCurrentSurah(Number(surahId)));
      } else if (!currentSurah && surahs.length > 0) {
        dispatch(setCurrentSurah(surahs[0].id));
      }
      
      if (authorId) {
        const author = authors.find(a => a.id === Number(authorId));
        if (author) {
          dispatch(setSelectedAuthor(author));
        }
      }
    }
  }, [surahId, authorId, readingType, authors, dispatch, currentSurah, surahs]);

  const handleSurahChange = (surahId: number) => {
    if (readingType === 'card') {
      dispatch(setCurrentSurah(surahId));
      const url = selectedAuthor 
        ? `/surah/${surahId}/verse/1/${selectedAuthor.id}`
        : `/surah/${surahId}/verse/1`;
      navigate(url, { replace: true });
    } else {
      dispatch(setBookCurrentSurahId(surahId));
      navigate(`/surah/${surahId}`, { replace: true });
    }
  };

  const handleAuthorChange = (authorId: number) => {
    const author = authors.find(a => a.id === Number(authorId));
    dispatch(setSelectedAuthor(author || null));
    
    if (readingType === 'card' && currentSurah) {
      if (verseId) {
        const url = author 
          ? `/surah/${currentSurah}/verse/${verseId}/${author.id}`
          : `/surah/${currentSurah}/verse/${verseId}`;
        navigate(url, { replace: true });
      } else {
        const url = author 
          ? `/surah/${currentSurah}/${author.id}`
          : `/surah/${currentSurah}`;
        navigate(url, { replace: true });
      }
    } else if (readingType === 'book' && surahId) {
      // Book modunda: mevcut verseId'yi koru
      if (verseId) {
        // VerseId varsa, onu koruyarak authorId ekle veya güncelle
        const url = author 
          ? `/surah/${surahId}/verse/${verseId}/${author.id}`
          : `/surah/${surahId}/verse/${verseId}`;
        navigate(url, { replace: true });
      } else {
        // VerseId yoksa, sadece authorId ekle (eğer author seçildiyse)
        // Artık /surah/:surahId/:authorId rotasını destekliyoruz, bu yüzden direkt oraya gidebiliriz
        if (author) {
          navigate(`/surah/${surahId}/${author.id}`, { replace: true });
        } else {
          navigate(`/surah/${surahId}`, { replace: true });
        }
      }
    }
  };

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const seekTime = (Number(e.target.value) / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
    setProgress(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto glass border-r border-border/50 pb-20">
        <div className="p-6 space-y-8">
          {readingType !== 'book' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.sidebar.selectSurah}
              </label>
              <div className="relative">
                <select
                  value={currentSurah || ''}
                  onChange={(e) => handleSurahChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-200"
                >
                  {surahs.map((surah) => (
                    <option key={surah.id} value={surah.id} className="font-serif">
                      {surah.id}. {surah.name_en} — {surah.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.sidebar.selectTranslator}
            </label>
            <div className="relative">
              <select
                value={selectedAuthor?.id || ''}
                onChange={(e) => handleAuthorChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-200"
              >
                <option value="">{t.sidebar.defaultTranslation}</option>
                {authors
                  .filter((author) => author.language === language) 
                  .map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {selectedSurah && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                {t.sidebar.surahAudio}
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg shadow-sm border border-border">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-foreground font-serif font-bold text-lg">
                        {selectedSurah.name_en} <span className="text-muted-foreground/40 font-normal ml-2">{selectedSurah.name}</span>
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={handlePlayPause}
                        className="p-1 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 focus:outline-none transition-all duration-300"
                        title={isPlaying ? t.sidebar.pauseAudio : t.sidebar.playAudio}
                      >
                        {isPlaying ? (
                          <PauseCircle className="h-8 w-8" />
                        ) : (
                          <PlayCircle className="h-8 w-8" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ReadingTypeSelector />

          {/* Root Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.root.searchRoot}
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = rootInput.trim();
                if (val) navigate(`/root/${encodeURIComponent(val)}`);
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={rootInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setRootInput(val);
                  setRootPreview(null);
                  if (rootDebounceRef.current) clearTimeout(rootDebounceRef.current);
                  if (val.trim().length >= 2) {
                    setRootLoading(true);
                    rootDebounceRef.current = setTimeout(() => {
                      fetchRootByLatin(val.trim())
                        .then(setRootPreview)
                        .catch(() => setRootPreview(null))
                        .finally(() => setRootLoading(false));
                    }, 500);
                  } else {
                    setRootLoading(false);
                  }
                }}
                placeholder={t.root.searchRootPlaceholder}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
              />
              {rootInput && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {rootLoading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setRootInput(''); setRootPreview(null); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}            </form>

            {/* Live preview card */}
            {rootPreview && !rootLoading && (
              <button
                onClick={() => navigate(`/root/${encodeURIComponent(rootPreview.latin)}`)}
                className="mt-2 w-full text-left p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-foreground leading-none" dir="rtl" lang="ar">
                    {rootPreview.arabic}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all font-mono">
                    {rootPreview.latin}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {language === 'en' ? rootPreview.mean_en : rootPreview.mean}
                </p>
                <div className="flex flex-wrap gap-1">
                  {rootPreview.diffs.slice(0, 4).map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border border-border text-xs"
                    >
                      <span dir="rtl" lang="ar" className="font-arabic text-foreground">{d.diff}</span>
                      <span className="text-primary font-medium">{d.count}×</span>
                    </span>
                  ))}
                  {rootPreview.diffs.length > 4 && (
                    <span className="text-xs text-muted-foreground self-center">+{rootPreview.diffs.length - 4}</span>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedSurah && (
        <div className="fixed bottom-0 left-0 w-72 bg-surface/95 backdrop-blur-xl border-t border-border shadow-2xl">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePlayPause} 
                className="text-primary hover:opacity-80"
                title={isPlaying ? t.sidebar.pauseAudio : t.sidebar.playAudio}
              >
                {isPlaying ? (
                  <PauseCircle className="h-8 w-8" />
                ) : (
                  <PlayCircle className="h-8 w-8" />
                )}
              </button>

              <div className="flex-grow">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-secondary rounded-full 
                  appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:bg-primary 
                  [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              <div className="flex items-center text-xs font-numbers font-medium tracking-tighter text-muted-foreground/60 space-x-2">
                <span>{formatTime(currentTime)}</span>
                <span className="opacity-30">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <audio 
                ref={audioRef} 
                src={
                  language === "tr"
                    ? selectedSurah.audio.mp3
                    : language === "en"
                    ? selectedSurah.audio.mp3_en
                    : undefined
                }
                preload="auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}