import { useState, useMemo } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { selectSurahs } from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { selectBookCurrentSurahId, setBookCurrentSurahId  } from '../store/slices/quranSlice';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { selectTranslationsLoading } from '../store/slices/translationsSlice';
import { selectViewType, setViewType, selectLayoutType, setLayoutType } from '../store/slices/uiSlice';
import { BookLayoutTopActions } from './book/BookLayoutTopActions';
import { BookLayoutSettingsPanel } from './book/BookLayoutSettingsPanel';
import { BookLayoutExpandedHeader } from './book/BookLayoutExpandedHeader';
import { BookLayoutCollapsedHeader } from './book/BookLayoutCollapsedHeader';
import { BookLayoutContent } from './book/BookLayoutContent';
import { useBookLayoutPagination } from '../hooks/useBookLayoutPagination';
import { useBookLayoutRoutingSync } from '../hooks/useBookLayoutRoutingSync';
import { useBookLayoutSearch } from '../hooks/useBookLayoutSearch';
import { Card } from './ui';

interface BookLayoutProps {
  verses: Verse[];
}

const TOTAL_QURAN_PAGES = 604;

export const BookLayout: React.FC<BookLayoutProps> = ({ verses }) => {
  const dispatch = useDispatch();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const surahs = useSelector(selectSurahs);
  const [stateCurrentPage, setCurrentPage] = useState(1);
  const [showFootnotes, setShowFootnotes] = useState<{ [key: number]: boolean }>({});
  const [inputPage, setInputPage] = useState('1');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const { surahId, verseId, pageNumber: urlPageNumber } = useParams();
  // Derive currentPage directly from URL to avoid stale-state renders during navigation
  const urlPageNum = urlPageNumber ? Number(urlPageNumber) : NaN;
  const currentPage = !Number.isNaN(urlPageNum) && urlPageNum >= 1 ? urlPageNum : stateCurrentPage;
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectTranslationsLoading);
  const viewType = useSelector(selectViewType);
  const layoutType = useSelector(selectLayoutType);

  const minPage = verses.length > 0 ? Math.min(...verses.map((verse) => verse.page)) : 1;
  const loadedMaxPage = verses.length > 0 ? Math.max(...verses.map((verse) => verse.page)) : 1;
  const totalPages = Math.max(TOTAL_QURAN_PAGES, loadedMaxPage);
  const currentPageVerses = useMemo(
    () => verses.filter((verse) => verse.page === currentPage),
    [verses, currentPage]
  );
  const versesBySurah = useMemo(
    () => currentPageVerses.reduce((acc, verse) => {
      if (!acc[verse.surah_id]) {
        acc[verse.surah_id] = [];
      }
      acc[verse.surah_id].push(verse);
      return acc;
    }, {} as { [key: number]: Verse[] }),
    [currentPageVerses]
  );

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
    minPage,
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
    handlePageBlur,
    handlePageKeyDown,
  } = useBookLayoutPagination({
    currentPage,
    minPage,
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
    <div className={`flex flex-col items-center ${layoutType === 'flipbook' ? 'justify-center bg-[#0a0a0a] overflow-hidden' : 'justify-start bg-gradient-to-b from-surface to-secondary p-0 sm:p-4'} ${layoutType === 'flipbook' ? 'h-screen' : 'min-h-[calc(100vh-64px)]'} transition-all duration-700`}>
      <Card className={`w-full ${layoutType === 'flipbook' ? 'max-w-none border-none p-0 bg-transparent flex-1 flex flex-col h-full' : 'max-w-4xl bg-surface rounded-none sm:rounded-lg shadow-none sm:shadow-lg border-none'} min-h-0 transition-all duration-500`}>
        <div className={layoutType === 'flipbook' ? 'absolute top-0 right-0 z-[80] p-4' : ''}>
          <BookLayoutTopActions
            isHeaderVisible={isHeaderVisible}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onToggleHeaderVisible={() => setIsHeaderVisible(!isHeaderVisible)}
            layoutType={layoutType}
          />
        </div>

        <BookLayoutSettingsPanel
          showSettings={showSettings}
          onClose={() => setShowSettings(false)}
          t={t}
          viewType={viewType}
          onSetViewType={(nextViewType) => dispatch(setViewType(nextViewType))}
          layoutType={layoutType}
          onSetLayoutType={(nextLayoutType) => dispatch(setLayoutType(nextLayoutType))}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
        />

        {layoutType !== 'flipbook' && (
          <>
            <BookLayoutExpandedHeader
              isHeaderVisible={isHeaderVisible}
              layoutType={layoutType}
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
              onPageInputBlur={handlePageBlur}
              onPageInputKeyDown={handlePageKeyDown}
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
          </>
        )}

        <BookLayoutContent
          isLoading={isLoading}
          loadingText={t.loading}
          verses={verses}
          versesBySurah={versesBySurah}
          surahs={surahs}
          viewType={viewType}
          layoutType={layoutType}
          fontSize={fontSize}
          lineHeight={lineHeight}
          showFootnotes={showFootnotes}
          onToggleFootnote={toggleFootnote}
          t={t}
        />
      </Card>
    </div>
  );
};
