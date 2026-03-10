import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { AppDispatch } from './store/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VerseCard } from './components/VerseCard';
import { BookLayout } from './components/BookLayout';
import { DetailLayout } from './components/DetailLayout';
import {
  fetchVerses,
  selectVerses,
  selectCurrentSurah,
  selectLoading,
  fetchAllSurahs,
  fetchAllVerses,
  selectAllVerses,
  setBookCurrentSurahId,
  setCurrentSurah,
  selectSurahs,
} from './store/slices/quranSlice';
import { selectSearchLanguage } from './store/slices/searchSlice';
import {
  fetchAllAuthors,
  selectSelectedAuthor,
  setSelectedAuthor,
  selectAuthors,
  setLoading,
} from './store/slices/translationsSlice';
import { useTranslations } from './translations';
import { selectReadingType } from './store/slices/uiSlice';
import { SearchDialog } from './components/SearchDialog';

function App() {
  const language = useSelector(selectSearchLanguage);
  const t = useTranslations();
  const [isPopoverVisible, setIsPopoverVisible] = useState(
    // !localStorage.getItem('languageChanged')
    false
  );
  const dispatch = useDispatch<AppDispatch>();
  const verses = useSelector(selectVerses);
  const allVerses = useSelector(selectAllVerses);
  const readingType = useSelector(selectReadingType);
  const currentSurah = useSelector(selectCurrentSurah);
  const loading = useSelector(selectLoading);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { surahId, authorId } = useParams();
  const surahs = useSelector(selectSurahs);
  const authors = useSelector(selectAuthors);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSurahs());
    dispatch(fetchAllAuthors());
  }, [dispatch]);

  useEffect(() => {
    if (currentSurah) {
      dispatch(fetchVerses({ surahId: currentSurah, authorId: selectedAuthor?.id }));
    }
  }, [dispatch, currentSurah, selectedAuthor]);

  useEffect(() => {
    if (readingType === 'book') {
      dispatch(fetchAllVerses(selectedAuthor?.id)).then(() => {
        dispatch(setLoading(false));
      });
    }
  }, [dispatch, readingType, selectedAuthor]);

  useEffect(() => {
    if (surahId) {
      if (readingType === 'book') {
        dispatch(setBookCurrentSurahId(Number(surahId)));
      } else {
        dispatch(setCurrentSurah(Number(surahId)));
      }

      if (authorId) {
        const author = authors.find(a => a.id === Number(authorId));
        if (author) {
          dispatch(setSelectedAuthor(author));
        }
      }
    } else if (!currentSurah && surahs.length > 0) {
      dispatch(setCurrentSurah(surahs[0].id));
    }
  }, [surahId, readingType, authorId, dispatch, authors, currentSurah, surahs]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Quran App</title>
          <meta name="description" content="Loading Quran content..." />
        </Helmet>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{readingType === 'card' && currentSurah ? `Surah ${currentSurah} | Quran App` : 'Quran App'}</title>
        <meta name="description" content="Read and study the Holy Quran with translations" />
        <meta name="keywords" content="quran, islam, surah, verses, translations" />
        <meta property="og:title" content="Quran App" />
        <meta property="og:description" content="Read and study the Holy Quran with translations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <html lang={language} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 pt-16">
        {isPopoverVisible && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] flex items-center justify-center"
            onClick={() => {
              setIsPopoverVisible(false);
              // localStorage.setItem('languageChanged', 'true');
            }}
          />
        )}
        <Header
          onMenuClick={toggleSidebar}
          onSearchOpen={() => setIsSearchOpen(true)}
        />

        <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        <div className="flex">
          <div
            className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 z-40 
            ${
              isSidebarOpen
                ? 'max-lg:opacity-100 max-lg:pointer-events-auto lg:opacity-100 lg:pointer-events-auto'
                : 'max-lg:opacity-0 max-lg:pointer-events-none lg:opacity-100 lg:pointer-events-auto'
            }
            `}
          >
            <div
              className={`fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden
                ${
                  isSidebarOpen
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none display-none'
                }`}
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className={`absolute top-0 left-0 h-full w-full transform transition-transform duration-300 lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
              <div className="absolute right-4 top-4 lg:hidden">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>

          <main className="flex-1 ml-0 lg:ml-72 transition-all duration-300">
            {readingType === 'book' ? (
              allVerses.length === 0 ? (
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
                  </div>
                </div>
              ) : (
                <BookLayout verses={allVerses} />
              )
            ) : readingType === 'detail' ? (
              <DetailLayout verses={verses} />
            ) : (
              <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {verses.map((verse) => (
                  <VerseCard key={verse.id} verse={verse} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
