import { useState, useEffect } from "react";
import { Book, Search, Menu, NotebookText, X, ChevronDown, Settings2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setLanguage, selectSearchLanguage } from "../store/slices/searchSlice";
import { useTranslations } from "../translations";
import { setSelectedAuthor, selectAuthors } from "../store/slices/translationsSlice";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchOpen: () => void;
}

export function Header({ onMenuClick, onSearchOpen }: HeaderProps) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const authors = useSelector(selectAuthors);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const selectFirstAuthorByLanguage = (lang: string) => {
    const filteredAuthors = authors.filter(author => author.language === lang);
    if (filteredAuthors.length > 0) {
      const selectedAuthor = filteredAuthors[0];
      dispatch(setSelectedAuthor(selectedAuthor));
    }
  };

  const handleLanguageChange = (newLang: "tr" | "en") => {
    dispatch(setLanguage(newLang));
    
    if (newLang === 'tr') {
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
      <div className="absolute inset-0 glass border-b border-border" />
    
      <nav className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-foreground hover:bg-secondary focus:ring-2 focus:ring-primary md:hidden transition-all"
              aria-label={t.header.menu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-sm transition-transform hover:scale-105 active:scale-95">
                <Book className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
                {t.title}
              </h1>
            </div>
          </div>


          <div className="hidden md:flex items-center gap-4">
            <a
              href="/notes"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-foreground hover:bg-secondary transition-all"
            >
              <NotebookText className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-medium">{t.header.notes}</span>
            </a>

            <button
              onClick={onSearchOpen}
              className="group p-2.5 rounded-xl text-foreground hover:bg-secondary transition-all"
              aria-label={t.header.search}
            >
              <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border border-border text-foreground transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    language === "tr" ? 'bg-primary' : 'bg-accent'
                  }`} />
                  <span className="font-medium">
                    {language === "tr" ? "Türkçe" : "English"}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
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
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface/95 backdrop-blur-sm shadow-xl border border-border overflow-hidden z-20">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      {t.header.selectLanguage}
                    </div>
                    {["en", "tr"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang as "en" | "tr")}
                        className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-all
                          ${language === lang 
                            ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary' 
                            : 'hover:bg-secondary text-foreground'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            lang === "tr" ? 'bg-primary' : 'bg-accent'
                          }`} />
                          <span>{lang === "tr" ? "Türkçe" : "English"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              to="/settings"
              className="group p-2.5 rounded-xl text-foreground hover:bg-secondary transition-all"
              aria-label={t.header.settings}
            >
                <Settings2 className="w-5 h-5 group-hover:text-primary transition-colors" />
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-foreground hover:bg-secondary transition-all"
            aria-label={isMobileMenuOpen ? t.header.close : t.header.menu}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface/95 backdrop-blur-lg border-b border-border shadow-xl md:hidden">
            <div className="p-4 space-y-3">
              <a
                href="/notes"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-all"
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-all"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">{t.header.search}</span>
              </button>

              <div className="space-y-2 bg-secondary rounded-xl p-3">
                <div className="px-3 py-2 text-sm font-semibold text-foreground">
                  {t.header.selectLanguage}
                </div>
                {["en", "tr"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang as "en" | "tr")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${language === lang 
                        ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-sm' 
                        : 'text-foreground hover:bg-surface'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${language === lang ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      <span className="font-medium">
                        {lang === "tr" ? "Türkçe" : "English"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <Link
                to="/settings"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings2 className="w-5 h-5" />
                <span className="font-medium">{t.header.settings}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
