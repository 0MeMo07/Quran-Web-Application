import { useCallback, useEffect, useState } from 'react';
import { type Verse } from '../api/types';

interface SurahOption {
  id: number;
  name: string;
  page_number?: number;
}

interface UseBookLayoutSearchParams {
  surahs: SurahOption[];
  verses: Verse[];
}

export function useBookLayoutSearch({ surahs, verses }: UseBookLayoutSearchParams) {
  const [searchSurah, setSearchSurah] = useState('');
  const [searchVerse, setSearchVerse] = useState('');
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [filteredSurahs, setFilteredSurahs] = useState(surahs);
  const [availableVerses, setAvailableVerses] = useState<number[]>([]);

  useEffect(() => {
    const selectedSurah = surahs.find((s) => s.name === searchSurah);
    if (selectedSurah) {
      const surahVerses = verses.filter((v) => v.surah_id === selectedSurah.id);
      const verseNumbers = [...new Set(surahVerses.map((v) => v.verse_number))];
      setAvailableVerses(verseNumbers.sort((a, b) => a - b));
    } else {
      setAvailableVerses([]);
    }
  }, [searchSurah, surahs, verses]);

  useEffect(() => {
    if (searchSurah) {
      const filtered = surahs.filter((s) =>
        s.name.toLowerCase().includes(searchSurah.toLowerCase())
      );
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs(surahs);
    }
  }, [searchSurah, surahs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.surah-dropdown') && !target.closest('.surah-input')) {
        setShowSurahDropdown(false);
      }
      if (!target.closest('.verse-dropdown') && !target.closest('.verse-input')) {
        setShowVerseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSurahChange = useCallback((value: string) => {
    setSearchSurah(value);
    setShowSurahDropdown(true);
  }, []);

  const handleSearchVerseChange = useCallback((value: string) => {
    setSearchVerse(value);
  }, []);

  const handleSurahInputFocus = useCallback(() => {
    setShowSurahDropdown(true);
  }, []);

  const handleVerseInputFocus = useCallback(() => {
    setShowVerseDropdown(true);
  }, []);

  const handleSurahSelect = useCallback((surahName: string) => {
    setSearchSurah(surahName);
    setShowSurahDropdown(false);
  }, []);

  const handleVerseSelect = useCallback((verseNumber: number) => {
    setSearchVerse(verseNumber.toString());
    setShowVerseDropdown(false);
  }, []);

  const closeDropdowns = useCallback(() => {
    setShowSurahDropdown(false);
    setShowVerseDropdown(false);
  }, []);

  return {
    searchSurah,
    searchVerse,
    showSurahDropdown,
    showVerseDropdown,
    filteredSurahs,
    availableVerses,
    setShowSurahDropdown,
    setShowVerseDropdown,
    handleSearchSurahChange,
    handleSearchVerseChange,
    handleSurahInputFocus,
    handleVerseInputFocus,
    handleSurahSelect,
    handleVerseSelect,
    closeDropdowns,
  };
}
