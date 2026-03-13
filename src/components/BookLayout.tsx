import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useSelector,useDispatch } from 'react-redux';
import { selectSurahs } from '../store/slices/quranSlice';
import { Verse } from '../api/types';
import { useTranslations } from '../translations';
import { selectBookCurrentSurahId, setBookCurrentSurahId  } from '../store/slices/quranSlice';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { selectTranslationsLoading } from '../store/slices/translationsSlice';
import { selectViewType, setViewType } from '../store/slices/uiSlice';
import { NoteSection } from './notes/BookNoteSection';
import { BookLayoutTopActions } from './book/BookLayoutTopActions';
import { BookLayoutSettingsPanel } from './book/BookLayoutSettingsPanel';
import { BookLayoutExpandedHeader } from './book/BookLayoutExpandedHeader';
import { BookLayoutCollapsedHeader } from './book/BookLayoutCollapsedHeader';

interface BookLayoutProps {
  verses: Verse[];
}

export const BookLayout: React.FC<BookLayoutProps> = ({ verses }) => {
  const dispatch = useDispatch();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const surahs = useSelector(selectSurahs);
  const [currentPage, setCurrentPage] = useState(0);
  //const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [showFootnotes, setShowFootnotes] = useState<{ [key: number]: boolean }>({});
  const [inputPage, setInputPage] = useState('0');
  const [searchSurah, setSearchSurah] = useState('');
  const [searchVerse, setSearchVerse] = useState('');
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [filteredSurahs, setFilteredSurahs] = useState(surahs);
  const [availableVerses, setAvailableVerses] = useState<number[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  useEffect(() => {
    const selectedSurah = surahs.find(s => s.name === searchSurah);
    if (selectedSurah) {
      const surahVerses = verses.filter(v => v.surah_id === selectedSurah.id);
      const verseNumbers = [...new Set(surahVerses.map(v => v.verse_number))];
      setAvailableVerses(verseNumbers.sort((a, b) => a - b));
    }
  }, [searchSurah, verses]);

  useEffect(() => {
    if (searchSurah) {
      const filtered = surahs.filter(s => 
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSurah = surahs.find(s => s.name === searchSurah);
    
    if (targetSurah) {
      const targetVerse = verses.find(v => 
        v.surah_id === targetSurah.id && 
        v.verse_number === Number(searchVerse)
      );

      if (targetVerse) {
        // Update URL to reflect surah/page without navigating to VersePage
        navigate(`/surah/${targetSurah.id}/page/${targetVerse.page}`, { replace: true });
        
        setCurrentPage(targetVerse.page);
        setInputPage(targetVerse.page.toString());
        dispatch(setBookCurrentSurahId(targetSurah.id));
        
        setTimeout(() => {
          const verseElement = document.querySelector(
            `[data-verse-id="${targetVerse.verse_number}"][data-surah-id="${targetSurah.id}"]`
          );
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 500);
      }
    }
    setShowSurahDropdown(false);
    setShowVerseDropdown(false);
  };

  const updateCurrentSurah = () => {
    const verseElements = document.querySelectorAll('[data-surah-id]');
    const headerHeight = 200;
    
    let currentSurah = null;
    for (const element of verseElements) {
      const rect = element.getBoundingClientRect();
      const surahId = Number(element.getAttribute('data-surah-id'));
      
      if (rect.top <= headerHeight) {
        currentSurah = surahId;
      }
    }
    
    if (currentSurah !== null && currentSurah !== currentSurahId) {
      dispatch(setBookCurrentSurahId(currentSurah));
      
      //otomatik surah seçip inputa yazdırma
      // const currentSurahName = surahs.find(s => s.id === currentSurah)?.name || '';
      // setSearchSurah(currentSurahName);
    }
  };


  useEffect(() => {
    window.addEventListener('scroll', updateCurrentSurah);
    updateCurrentSurah();

    return () => {
      window.removeEventListener('scroll', updateCurrentSurah);
    };
  }, [currentPage]);

  useEffect(() => {
    if (currentPageVerses.length > 0) {
      const firstSurahId = currentPageVerses[0].surah_id;
      dispatch(setBookCurrentSurahId(firstSurahId));
      
      // Eğer URL'de surahId yoksa ve verseId yoksa, URL'yi güncelle
      if (!surahId && !verseId && currentPage > 0) {
        navigate(`/surah/${firstSurahId}/page/${currentPage}`, { replace: true });
      }
    }
  }, [currentPage, dispatch, surahId, verseId, navigate, currentPageVerses]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setInputPage(newPage.toString());
      window.scrollTo(0, 0);
      // Sayfa değiştiğinde URL'yi page formatına güncelle
      // surahId yoksa currentSurahId kullan
      const targetSurahId = surahId || currentSurahId;
      if (targetSurahId) {
        navigate(`/surah/${targetSurahId}/page/${newPage}`, { replace: true });
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setInputPage(newPage.toString());
      window.scrollTo(0, 0);
      // Sayfa değiştiğinde URL'yi page formatına güncelle
      // surahId yoksa currentSurahId kullan
      const targetSurahId = surahId || currentSurahId;
      if (targetSurahId) {
        navigate(`/surah/${targetSurahId}/page/${newPage}`, { replace: true });
      }
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPage(value);
    const pageNumber = Number(value);
    if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
      // Sayfa değiştiğinde URL'yi page formatına güncelle
      // surahId yoksa currentSurahId kullan
      const targetSurahId = surahId || currentSurahId;
      if (targetSurahId) {
        navigate(`/surah/${targetSurahId}/page/${pageNumber}`, { replace: true });
      }
    }
  };

  const toggleFootnote = (verseId: number) => {
    setShowFootnotes((prev) => ({ ...prev, [verseId]: !prev[verseId] }));
  };

  const getCurrentSurahName = () => {
    if (!currentSurahId) return t.sidebar.selectSurah;
    const surah = surahs.find(s => s.id === currentSurahId);
    return surah?.name || t.sidebar.selectSurah;
  };

  useEffect(() => {
    if (surahId && verseId) {
      const targetVerse = verses.find(
        v => v.surah_id === Number(surahId) && v.verse_number === Number(verseId)
      );
      
      if (targetVerse) {
        setCurrentPage(targetVerse.page);
        setInputPage(targetVerse.page.toString());
        dispatch(setBookCurrentSurahId(Number(surahId)));
        
        // Sayfa render olduktan sonra scroll yap
        setTimeout(() => {
          const verseElement = document.querySelector(
            `[data-verse-id="${targetVerse.verse_number}"][data-surah-id="${Number(surahId)}"]`
          );
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 300);
      }
    } else if (surahId && urlPageNumber) {
      // URL'de pageNumber varsa, o sayfaya git
      const pageNum = Number(urlPageNumber);
      if (!isNaN(pageNum) && pageNum >= 0 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        setInputPage(pageNum.toString());
        dispatch(setBookCurrentSurahId(Number(surahId)));
        window.scrollTo(0, 0);
      }
    } else if (surahId && !verseId) {
      // URL'de pageNumber yoksa ama surahId varsa, ilk ayetin sayfasına git ve URL'yi güncelle
      const stateVerse = (location.state as any)?.targetVerseId;
      const targetVerseNumber = stateVerse ? Number(stateVerse) : null;
      const firstVerseOfSurah = targetVerseNumber
        ? verses.find(v => v.surah_id === Number(surahId) && v.verse_number === targetVerseNumber)
        : verses.find(v => v.surah_id === Number(surahId));
      if (firstVerseOfSurah) {
        const pageToSet = firstVerseOfSurah.page;
        setCurrentPage(pageToSet);
        setInputPage(pageToSet.toString());
        dispatch(setBookCurrentSurahId(Number(surahId)));
        navigate(`/surah/${surahId}/page/${pageToSet}`, { replace: true });
        window.scrollTo(0, 0);
        if (targetVerseNumber) {
          setTimeout(() => {
            const el = document.querySelector(
              `[data-verse-id="${targetVerseNumber}"][data-surah-id="${Number(surahId)}"]`
            );
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
              setTimeout(() => el.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'), 2000);
            }
          }, 500);
        }
      }
    }
  }, [surahId, verseId, urlPageNumber, verses, dispatch, totalPages]);

  // İlk yükleme tamamlandıktan sonra flag'i false yap
  useEffect(() => {
    if (verses.length > 0 && surahId) {
      setIsInitialLoad(false);
    }
  }, [verses.length, surahId]);

  // Sayfa değiştiğinde URL'yi güncelle (verseId yoksa ve sayfa değiştirme fonksiyonları dışında)
  // NOT: handleNextPage, handlePreviousPage, handlePageChange zaten URL'yi güncelliyor
  // Bu useEffect sadece başka bir şekilde sayfa değiştiğinde çalışmalı
  useEffect(() => {
    // İlk yükleme sırasında çalışmasın
    if (isInitialLoad) return;
    
    // surahId yoksa currentSurahId kullan
    const targetSurahId = surahId || currentSurahId;
    if (targetSurahId && !verseId && currentPage > 0) {
      // URL'deki pageNumber ile currentPage farklıysa güncelle
      const urlPage = urlPageNumber ? Number(urlPageNumber) : null;
      if (urlPage !== currentPage) {
        navigate(`/surah/${targetSurahId}/page/${currentPage}`, { replace: true });
      }
    }
  }, [currentPage, surahId, currentSurahId, verseId, urlPageNumber, navigate, isInitialLoad]);

  // Sayfa değiştiğinde ve verseId varsa, ayete scroll et
  useEffect(() => {
    if (surahId && verseId && currentPage > 0) {
      const targetVerse = verses.find(
        v => v.surah_id === Number(surahId) && v.verse_number === Number(verseId) && v.page === currentPage
      );
      
      if (targetVerse) {
        // Sayfa render olduktan sonra scroll yap
        setTimeout(() => {
          const verseElement = document.querySelector(
            `[data-verse-id="${targetVerse.verse_number}"][data-surah-id="${Number(surahId)}"]`
          );
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            setTimeout(() => {
              verseElement.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }, 2000);
          }
        }, 300);
      }
    }
  }, [currentPage, surahId, verseId, verses]);


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
          onSearchSurahChange={(value) => {
            setSearchSurah(value);
            setShowSurahDropdown(true);
          }}
          onSearchVerseChange={setSearchVerse}
          onSurahInputFocus={() => setShowSurahDropdown(true)}
          onVerseInputFocus={() => setShowVerseDropdown(true)}
          onSurahSelect={(surahName) => {
            setSearchSurah(surahName);
            setShowSurahDropdown(false);
          }}
          onVerseSelect={(verseNumber) => {
            setSearchVerse(verseNumber.toString());
            setShowVerseDropdown(false);
          }}
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

        <div className="p-3 sm:p-6 space-y-6 relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
              </div>
            </div>
          ) : null}

          {Object.entries(versesBySurah).map(([surahId, surahVerses]) => (
            <div key={surahId} data-surah-id={surahId}>
              <div className="flex items-center justify-center mb-6 relative">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                <h2 className="relative px-6 py-2 bg-white dark:bg-gray-800 text-lg sm:text-xl font-semibold">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {surahs.find(s => s.id === Number(surahId))?.name}
                  </span>
              </h2>
              </div>
              

              <div
                className={`
                  ${viewType === 'kuran' 
                    ? 'rtl text-right px-8 py-6 leading-[3] max-w-4xl mx-auto whitespace-normal'
                    : 'space-y-4'
                  }
                `}
                dir={viewType === 'kuran' ? 'rtl' : 'ltr'}
              >
              {surahVerses.map((verse) => (
                <div 
                  key={verse.id}
                  data-verse-id={verse.verse_number}
                  data-surah-id={verse.surah_id}
                  className="relative group"
                >
                  {/* Kuran metni */}
                  {(viewType === 'kuran' || viewType === 'kuran+meal') && (
                    <div className={viewType === 'kuran' ? 'inline break-words' : 'mb-4'}>
                      <span
                        className={`
                          font-scheherazade text-gray-800 dark:text-gray-200 select-text tracking-wide
                          ${viewType === 'kuran' 
                            ? 'text-4xl mx-1 inline break-words'
                            : 'text-3xl block text-right'
                          }
                        `}
                        style={{ 
                          wordSpacing: '0.1em',
                          fontSize: viewType === 'kuran' 
                            ? `${fontSize * 2}px`
                            : `${fontSize * 2}px`
                        }}
                      >
                        {verse.verse}
                        {viewType === 'kuran' && (
                          <span 
                            className="inline-block mx-1 text-gray-500 dark:text-gray-400 align-middle"
                            style={{
                              fontSize: `${fontSize}px`
                            }}
                          >
                            ﴿{verse.verse_number}﴾
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Meal */}
                  {(viewType === 'meal' || viewType === 'meal+kuran' || viewType === 'kuran+meal') && (
                    <div className={`
                      ${viewType !== 'meal' ? 'border-t dark:border-gray-700 pt-4' : ''}
                    `}>
                  <p className="text-gray-800 dark:text-gray-200">
                      <span 
                        className="text-gray-700 dark:text-gray-300"
                            style={{ fontSize: `${fontSize}px`, lineHeight }}
                      >
                      {verse.translation?.text}{' '}
                    </span>
                      <span 
                        className="text-gray-600 dark:text-gray-400 font-bold"
                            style={{ fontSize: `${fontSize * 0.9}px`, lineHeight }}
                      >
                      ﴾{verse.verse_number}﴿
                    </span>
                  </p>
                    </div>
                  )}

                  {viewType !== 'kuran' && (verse.translation?.footnotes?.length ?? 0) > 0 && (
                    <div className={`
                      ${viewType === 'meal' ? 'mt-2' : 'mt-3'}
                    `}>
                  <button
                    onClick={() => toggleFootnote(verse.id)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm flex items-center gap-2"
                  >
                        <span style={{ fontSize: `${fontSize * 0.75}px` }}>
                      {showFootnotes[verse.id] ? t.verse.hideFootnotes : t.verse.showFootnotes}
                        </span>
                        {showFootnotes[verse.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                      {showFootnotes[verse.id] && (
                        <div className="mt-2 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-2">
                      {verse.translation?.footnotes?.map((footnote) => (
                          <p 
                            key={footnote.id} 
                            className="text-gray-600 dark:text-gray-400 italic"
                                style={{ fontSize: `${fontSize * 0.8}px`, lineHeight }}
                          >
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  [{footnote.number}]
                                </span>{' '}
                                {footnote.text}
                        </p>
                      ))}
                        </div>
                      )}
                  </div>
                )}

                <NoteSection
                  verseId={verse.verse_number}
                  surahId={verse.surah_id}
                  t={t}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  verseText={verse.translation?.text}
                  verseNumber={verse.verse_number}
                />
              </div>
            ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
