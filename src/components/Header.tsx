import React, { useState, useEffect } from "react";
import { Book, Moon, Sun, Search, Menu, NotebookText, X, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, selectIsDarkMode } from "../store/slices/uiSlice";
import { setLanguage, selectSearchLanguage } from "../store/slices/searchSlice";
import { useTranslations } from "../translations";
import { setSelectedAuthor, selectAuthors } from "../store/slices/translationsSlice";
import { setLoading } from "../store/slices/translationsSlice";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchOpen: () => void;
}

export function Header({ onMenuClick, onSearchOpen }: HeaderProps) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const isDarkMode = useSelector(selectIsDarkMode);
  const language = useSelector(selectSearchLanguage);
  const authors = useSelector(selectAuthors);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const selectFirstAuthorByLanguage = (lang: string) => {
    dispatch(setLoading(true));
    const filteredAuthors = authors.filter(author => author.language === lang);
    if (filteredAuthors.length > 0) {
      const selectedAuthor = filteredAuthors[0];
      dispatch(setSelectedAuthor(selectedAuthor));
    }
  };

  const handleLanguageChange = (newLang: "tr" | "en") => {
    dispatch(setLanguage(newLang));
    
    if (newLang === 'tr') {
      dispatch(setLoading(true));
      dispatch(setSelectedAuthor(null));
    } else {
      selectFirstAuthorByLanguage(newLang);
    }
    
    setIsLangMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="absolute inset-0 backdrop-blur-xl bg-white/75 dark:bg-gray-900/75 border-b border-gray-200/50 dark:border-gray-800/50" />
    
      <nav className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 md:hidden transition-all"
              aria-label={t.header.menu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-lg">
                <Book className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
          </div>


          <div className="hidden md:flex items-center gap-4">
            <a
              href="/notes"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <NotebookText className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
              <span className="font-medium">{t.header.notes}</span>
            </a>

            <button
              onClick={onSearchOpen}
              className="group p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label={t.header.search}
            >
              <Search className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 dark:from-emerald-500/10 dark:to-teal-500/10 dark:hover:from-emerald-500/20 dark:hover:to-teal-500/20 border border-emerald-200/50 dark:border-emerald-800/50 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    language === "tr" ? 'bg-emerald-500' : 'bg-teal-500'
                  }`} />
                  <span className="font-medium">
                    {language === "tr" ? "Türkçe" : "English"}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    isLangMenuOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

  
              {isLangMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-20">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-gray-700/50">
                      {t.header.selectLanguage}
                    </div>
                    {["en", "tr"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang as "en" | "tr")}
                        className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-all
                          ${language === lang 
                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            lang === "tr" ? 'bg-emerald-500' : 'bg-teal-500'
                          }`} />
                          <span>{lang === "tr" ? "Türkçe" : "English"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="group p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label={isDarkMode ? t.header.lightMode : t.header.darkMode}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label={t.header.menu}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-xl md:hidden">
            <div className="p-4 space-y-3">
              <a
                href="/notes"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <NotebookText className="w-5 h-5" />
                <span className="font-medium">{t.header.notes}</span>
              </a>

              <button
                onClick={() => {
                  onSearchOpen();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">{t.header.search}</span>
              </button>

              <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                  {t.header.selectLanguage}
                </div>
                {["en", "tr"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang as "en" | "tr")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${language === lang 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${language === lang ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="font-medium">
                        {lang === "tr" ? "Türkçe" : "English"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  dispatch(toggleTheme());
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">{t.header.lightMode}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">{t.header.darkMode}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
