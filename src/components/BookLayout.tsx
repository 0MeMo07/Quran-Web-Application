import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSurahs, 
  selectBookCurrentSurahId, 
  setBookCurrentSurahId, 
  selectLoading, 
  selectLoadingBookSurahIds, 
  setHighlightedVerse, 
  selectPendingVerseJump, 
  setPendingVerseJump, 
  clearPendingVerseJump 
} from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { useParams, useNavigate } from 'react-router-dom';
import { selectViewType, setViewType, selectBookLayoutType, setBookLayoutType } from '../store/slices/uiSlice';
import { BookLayoutTopActions } from './book/layout/BookLayoutTopActions';
import { BookLayoutSettingsPanel } from './book/layout/BookLayoutSettingsPanel';
import { BookLayoutExpandedHeader } from './book/layout/BookLayoutExpandedHeader';
import { BookLayoutCollapsedHeader } from './book/layout/BookLayoutCollapsedHeader';
import { BookLayoutContent } from './book/layout/BookLayoutContent';
import { FlipBookContent } from './book/flip-book/FlipBookContent';
import { useBookLayoutPagination } from '../hooks/useBookLayoutPagination';
import { useBookLayoutRoutingSync } from '../hooks/useBookLayoutRoutingSync';
import { useBookLayoutSearch } from '../hooks/useBookLayoutSearch';
import { useVerseNavigation } from '../hooks/useVerseNavigation';
import { Card } from './ui';
import { cn } from './ui/cn';

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
  
  const urlPageNum = urlPageNumber ? Number(urlPageNumber) : NaN;
  const currentPage = !Number.isNaN(urlPageNum) && urlPageNum >= 1 ? urlPageNum : stateCurrentPage;
  const navigate = useNavigate();
  const isGlobalLoading = useSelector(selectLoading);
  const loadingSurahIds = useSelector(selectLoadingBookSurahIds);
  const findSurahByPage = (page: number) => {
    return [...surahs]
      .sort((a, b) => b.page_number - a.page_number)
      .find(s => s.page_number <= page)?.id;
  };
  const targetSurahIdForPage = findSurahByPage(currentPage);
  const isIncrementalLoading = targetSurahIdForPage ? loadingSurahIds.includes(targetSurahIdForPage) : false;
  const isLoading = isGlobalLoading || isIncrementalLoading;
  const viewType = useSelector(selectViewType);
  const bookLayoutType = useSelector(selectBookLayoutType);

  const minPage = verses.length > 0 ? Math.min(...verses.map((verse) => verse.page)) : 1;
  const loadedMaxPage = verses.length > 0 ? Math.max(...verses.map((verse) => verse.page)) : 1;
  const totalPages = Math.max(TOTAL_QURAN_PAGES, loadedMaxPage);
  
  const currentPageVerses = useMemo(
    () => verses.filter((verse) => verse.page === currentPage),
    [verses, currentPage]
  );
  
  const versesBySurah = useMemo(
    () => currentPageVerses.reduce((acc: Record<number, Verse[]>, verse: Verse) => {
      if (!acc[verse.surah_id]) {
        acc[verse.surah_id] = [];
      }
      acc[verse.surah_id].push(verse);
      return acc;
    }, {} as Record<number, Verse[]>),
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

  const pendingVerseJump = useSelector(selectPendingVerseJump);

  const { navigateToVerse } = useVerseNavigation({
    verses,
    surahs,
    setCurrentPage,
    setInputPage,
    setCurrentSurahId: (id) => dispatch(setBookCurrentSurahId(id)),
    setHighlightedVerse: (payload) => dispatch(setHighlightedVerse(payload)),
    pendingVerseJump,
    setPendingVerseJump: (payload) => dispatch(setPendingVerseJump(payload)),
    clearPendingVerseJump: () => dispatch(clearPendingVerseJump()),
  });

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
    navigate,
    setCurrentPage,
    setInputPage,
    setCurrentSurahIdInStore: (id: number) => dispatch(setBookCurrentSurahId(id)),
    navigateToVerse,
  });

  const {
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    handlePageJump,
    handlePageBlur,
    handlePageKeyDown,
  } = useBookLayoutPagination({
    currentPage,
    minPage,
    totalPages,
    surahs,
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

  const isPageFlip = bookLayoutType === 'pageflip';

  return (
    <div className={cn(
      "flex flex-col items-center justify-start transition-all duration-700 w-full",
      isPageFlip ? "p-0 min-h-screen h-screen overflow-hidden" : "bg-gradient-to-b from-surface to-secondary p-0 sm:p-4 min-h-[calc(100vh-64px)]"
    )}>
      <Card className={cn(
        "w-full transition-all duration-500 min-h-0 border-none",
        isPageFlip ? "max-w-none bg-transparent shadow-none rounded-none h-full" : "max-w-4xl bg-surface rounded-none sm:rounded-lg shadow-none sm:shadow-lg"
      )}>
        {!isPageFlip && (
          <BookLayoutTopActions
            isHeaderVisible={isHeaderVisible}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onToggleHeaderVisible={() => setIsHeaderVisible(!isHeaderVisible)}
          />
        )}

        <BookLayoutSettingsPanel
          showSettings={showSettings}
          onClose={() => setShowSettings(false)}
          t={t}
          viewType={viewType}
          onSetViewType={(nextViewType) => dispatch(setViewType(nextViewType))}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          bookLayoutType={bookLayoutType}
          onSetBookLayoutType={(nextLayout) => dispatch(setBookLayoutType(nextLayout))}
        />

        {!isPageFlip && (
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
            onPageInputBlur={handlePageBlur}
            onPageInputKeyDown={handlePageKeyDown}
          />
        )}

        {!isPageFlip && (
          <BookLayoutCollapsedHeader
            isHeaderVisible={isHeaderVisible}
            currentSurahName={getCurrentSurahName()}
            pageLabel={t.verse.page}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        )}

        {isPageFlip ? (
          <FlipBookContent
            propPage={currentPage}
            onPageChange={handlePageJump}
            t={t}
            onShowSettings={() => setShowSettings(true)}
          />
        ) : (
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
        )}
      </Card>
    </div>
  );
};
