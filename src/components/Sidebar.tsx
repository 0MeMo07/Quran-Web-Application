import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, Github } from 'lucide-react';
import { selectSurahs, setCurrentSurah, selectCurrentSurah, selectBookCurrentSurahId, setBookCurrentSurahId } from '../store/slices/quranSlice';
import { selectAuthors, selectSelectedAuthor, setSelectedAuthor } from '../store/slices/translationsSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { useTranslations } from '../translations';
import { selectReadingType } from '../store/slices/uiSlice';
import { ReadingTypeSelector } from "./ReadingTypeSelector";
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarRootSearch } from './root/SidebarRootSearch';
import { SidebarAudioPlayer } from './audio/SidebarAudioPlayer';

export function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentSurahId = useSelector(selectBookCurrentSurahId);
  const t = useTranslations();
  const readingType = useSelector(selectReadingType);
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);
  const currentSurah = useSelector(selectCurrentSurah);
  const authors = useSelector(selectAuthors);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const { surahId, authorId } = useParams();

  const selectedSurah = readingType === 'book' 
    ? surahs.find((surah) => surah.id === currentSurahId)
    : surahs.find((surah) => surah.id === currentSurah);

  useEffect(() => {
    if (readingType === 'card') {
      if (surahId) {
        dispatch(setCurrentSurah(Number(surahId)));
      } else if (!currentSurah && surahs.length > 0) {
        dispatch(setCurrentSurah(surahs[0].id));
      }
      
      if (authorId) {
        const author = authors.find(a => a.id === Number(authorId));
        if (author) {
          dispatch(setSelectedAuthor(author));
        }
      }
    }
  }, [surahId, authorId, readingType, authors, dispatch, currentSurah, surahs]);

  const handleSurahChange = (surahId: number) => {
    if (readingType === 'card') {
      dispatch(setCurrentSurah(surahId));
      const url = selectedAuthor 
        ? `/surah/${surahId}/verse/1/${selectedAuthor.id}`
        : `/surah/${surahId}/verse/1`;
      navigate(url, { replace: true });
    } else {
      dispatch(setBookCurrentSurahId(surahId));
      navigate(`/surah/${surahId}`, { replace: true });
    }
  };

  const handleAuthorChange = (authorId: number) => {
    const author = authors.find(a => a.id === Number(authorId));
    dispatch(setSelectedAuthor(author || null));
    
    if (readingType === 'card' && currentSurah) {
      const url = author 
        ? `/surah/${currentSurah}/verse/1/${author.id}`
        : `/surah/${currentSurah}/verse/1`;
      navigate(url, { replace: true });
    } else if (readingType === 'book' && surahId) {
      if (author) {
        navigate(`/surah/${surahId}/${author.id}`, { replace: true });
      } else {
        navigate(`/surah/${surahId}`, { replace: true });
      }
    }
  };

  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto glass border-r border-border/50 pb-20">
        <div className="p-6 space-y-8">
          {readingType !== 'book' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.sidebar.selectSurah}
              </label>
              <div className="relative">
                <select
                  value={currentSurah || ''}
                  onChange={(e) => handleSurahChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-200"
                >
                  {surahs.map((surah) => (
                    <option key={surah.id} value={surah.id} className="font-serif">
                      {surah.id}. {surah.name_en} — {surah.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.sidebar.selectTranslator}
            </label>
            <div className="relative">
              <select
                value={selectedAuthor?.id || ''}
                onChange={(e) => handleAuthorChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all duration-200"
              >
                <option value="">{t.sidebar.defaultTranslation}</option>
                {authors
                  .filter((author) => author.language === language) 
                  .map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {selectedSurah && (
            <SidebarAudioPlayer selectedSurah={selectedSurah as any} language={language} />
          )}

          <ReadingTypeSelector />

          {/* Root Search */}
          <SidebarRootSearch language={language} />

          {/* Contribute Section */}
          <div className="pt-4 mt-6 border-t border-border/50">
            <a
              href="https://github.com/0Memo07/Quran-Web-Application"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl bg-secondary/40 hover:bg-secondary text-foreground/80 hover:text-foreground transition-all duration-200 border border-border shadow-sm group"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all duration-200" />
              <span className="text-sm font-medium">Contribute & Star</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}