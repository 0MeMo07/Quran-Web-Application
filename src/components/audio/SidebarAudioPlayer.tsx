import { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle } from 'lucide-react';
import { useTranslations } from '../../translations';

interface SidebarAudioPlayerProps {
  selectedSurah: {
    id: number;
    name: string;
    name_en: string;
    audio: {
      mp3: string;
      mp3_en: string;
    };
  };
  language: string;
}

export function SidebarAudioPlayer({ selectedSurah, language }: SidebarAudioPlayerProps) {
  const t = useTranslations();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setProgress(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
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

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [selectedSurah, language]);

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioElement.duration) return;

    const seekTime = (Number(e.target.value) / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
    setProgress(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const audioSrc = language === 'tr' ? selectedSurah.audio.mp3 : selectedSurah.audio.mp3_en;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground mb-4">
          {t.sidebar.surahAudio}
        </label>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg shadow-sm border border-border">
            <div className="flex items-center space-x-3 w-full justify-between">
              <div>
                <p className="text-foreground font-serif font-bold text-lg">
                  {selectedSurah.name_en} <span className="text-muted-foreground/40 font-normal ml-2">{selectedSurah.name}</span>
                </p>
              </div>
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

      {/* Floating Audio Bar */}
      <div className="fixed bottom-0 left-0 w-72 bg-surface/95 backdrop-blur-xl border-t border-border shadow-2xl z-30">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePlayPause} 
              className="text-primary hover:opacity-80 flex-shrink-0"
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

            <div className="flex items-center text-xs font-numbers font-medium tracking-tighter text-muted-foreground/60 space-x-2 flex-shrink-0">
              <span>{formatTime(currentTime)}</span>
              <span className="opacity-30">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <audio 
              ref={audioRef} 
              src={audioSrc}
              preload="auto"
            />
          </div>
        </div>
      </div>
    </>
  );
}
