import { useState, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudioId(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  const playAudio = useCallback((audioUrl: string, id: number) => {
    if (currentAudioId === id) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }
      return;
    }

    if (currentAudioId !== null) {
      stopCurrentAudio();
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentAudioId(null);
      setCurrentTime(0);
    };

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    audioRef.current.onloadedmetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
    });

    setIsPlaying(true);
    setCurrentAudioId(id);
  }, [currentAudioId, isPlaying, stopCurrentAudio]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  return {
    isPlaying,
    currentAudioId,
    currentTime,
    duration,
    playAudio,
    stopAudio: stopCurrentAudio,
    seek,
  };
}