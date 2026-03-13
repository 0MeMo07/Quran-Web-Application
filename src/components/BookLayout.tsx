import { useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { selectSurahs } from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { selectBookCurrentSurahId, setBookCurrentSurahId  } from '../store/slices/quranSlice';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { selectTranslationsLoading } from '../store/slices/translationsSlice';
import { selectViewType, setViewType } from '../store/slices/uiSlice';
import { BookLayoutTopActions } from './book/BookLayoutTopActions';
import { BookLayoutSettingsPanel } from './book/BookLayoutSettingsPanel';
import { BookLayoutExpandedHeader } from './book/BookLayoutExpandedHeader';
import { BookLayoutCollapsedHeader } from './book/BookLayoutCollapsedHeader';
import { BookLayoutContent } from './book/BookLayoutContent';
import { useBookLayoutPagination } from '../hooks/useBookLayoutPagination';
import { useBookLayoutRoutingSync } from '../hooks/useBookLayoutRoutingSync';
import { useBookLayoutSearch } from '../hooks/useBookLayoutSearch';

interface BookLayoutProps {
  verses: Verse[];
}

export const BookLayout: React.FC<BookLayoutProps> = ({ verses }) => {
  const dispatch = useDispatch();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const surahs = useSelector(selectSurahs);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFootnotes, setShowFootnotes] = useState<{ [key: number]: boolean }>({});
  const [inputPage, setInputPage] = useState('0');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const { surahId, verseId, pageNumber: urlPageNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectTranslationsLoading);
  const viewType = useSelector(selectViewType);

  const totalPages = Math.max(...verses.map((verse) => verse.page));
  const currentPageVerses = verses.filter((verse) => verse.page === currentPage);
  const versesBySurah = currentPageVerses.reduce((acc, verse) => {
    if (!acc[verse.surah_id]) {
      acc[verse.surah_id] = [];
    }
    acc[verse.surah_id].push(verse);
    return acc;
  }, {} as { [key: number]: Verse[] });

  const {
    searchSurah,
    searchVerse,
    showSurahDropdown,
    showVerseDropdown,
    filteredSurahs,
    availableVerses,
    handleSearchSurahChange,
    handleSearchVerseChange,
    handleSurahInputFocus,
    handleVerseInputFocus,
    handleSurahSelect,
    handleVerseSelect,
    closeDropdowns,
  } = useBookLayoutSearch({ surahs, verses });

  const { handleSearch } = useBookLayoutRoutingSync({
    verses,
    surahs,
    searchSurah,
    searchVerse,
    closeDropdowns,
    surahId,
    verseId,
    urlPageNumber,
    currentPage,
    totalPages,
    currentSurahId,
    currentPageVerses,
    locationState: location.state,
    navigate,
    setCurrentPage,
    setInputPage,
    setCurrentSurahIdInStore: (id) => dispatch(setBookCurrentSurahId(id)),
  });

  const {
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
  } = useBookLayoutPagination({
    currentPage,
    totalPages,
    surahId,
    currentSurahId,
    navigate,
    setCurrentPage,
    setInputPage,
  });

  const toggleFootnote = (verseId: number) => {
    setShowFootnotes((prev) => ({ ...prev, [verseId]: !prev[verseId] }));
  };

  const getCurrentSurahName = () => {
    if (!currentSurahId) return t.sidebar.selectSurah;
    const surah = surahs.find(s => s.id === currentSurahId);
    return surah?.name || t.sidebar.selectSurah;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <BookLayoutTopActions
          isHeaderVisible={isHeaderVisible}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleHeaderVisible={() => setIsHeaderVisible(!isHeaderVisible)}
        />

        <BookLayoutSettingsPanel
          showSettings={showSettings}
          t={t}
          viewType={viewType}
          onSetViewType={(nextViewType) => dispatch(setViewType(nextViewType))}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
        />

        <BookLayoutExpandedHeader
          isHeaderVisible={isHeaderVisible}
          currentSurahName={getCurrentSurahName()}
          currentPage={currentPage}
          totalPages={totalPages}
          pageLabel={t.verse.page}
          ofLabel={t.verse.of}
          selectSurahLabel={t.sidebar.selectSurah}
          verseLabel={t.verse.verse}
          searchSurah={searchSurah}
          searchVerse={searchVerse}
          showSurahDropdown={showSurahDropdown}
          showVerseDropdown={showVerseDropdown}
          filteredSurahs={filteredSurahs}
          availableVerses={availableVerses}
          inputPage={inputPage}
          onSearchSubmit={handleSearch}
          onSearchSurahChange={handleSearchSurahChange}
          onSearchVerseChange={handleSearchVerseChange}
          onSurahInputFocus={handleSurahInputFocus}
          onVerseInputFocus={handleVerseInputFocus}
          onSurahSelect={handleSurahSelect}
          onVerseSelect={handleVerseSelect}
          onPrevPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onPageInputChange={handlePageChange}
        />

        <BookLayoutCollapsedHeader
          isHeaderVisible={isHeaderVisible}
          currentSurahName={getCurrentSurahName()}
          pageLabel={t.verse.page}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />

        <BookLayoutContent
          isLoading={isLoading}
          loadingText={t.loading}
          versesBySurah={versesBySurah}
          surahs={surahs}
          viewType={viewType}
          fontSize={fontSize}
          lineHeight={lineHeight}
          showFootnotes={showFootnotes}
          onToggleFootnote={toggleFootnote}
          t={t}
        />
      </div>
    </div>
  );
};
