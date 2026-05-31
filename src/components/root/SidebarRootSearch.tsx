import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Loader2, X } from 'lucide-react';
import { useTranslations } from '../../translations';
import { fetchRootByLatin } from '../../api/quranApi';
import type { RootDetail } from '../../api/types';

interface SidebarRootSearchProps {
  language: string;
}

export function SidebarRootSearch({ language }: SidebarRootSearchProps) {
  const navigate = useNavigate();
  const t = useTranslations();
  const [rootInput, setRootInput] = useState('');
  const [rootPreview, setRootPreview] = useState<RootDetail | null>(null);
  const [rootLoading, setRootLoading] = useState(false);
  const rootDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rootDebounceRef.current) {
        clearTimeout(rootDebounceRef.current);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = rootInput.trim();
    if (val) {
      navigate(`/root/${encodeURIComponent(val)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRootInput(val);
    setRootPreview(null);
    if (rootDebounceRef.current) {
      clearTimeout(rootDebounceRef.current);
    }
    if (val.trim().length >= 2) {
      setRootLoading(true);
      rootDebounceRef.current = setTimeout(() => {
        fetchRootByLatin(val.trim())
          .then(setRootPreview)
          .catch(() => setRootPreview(null))
          .finally(() => setRootLoading(false));
      }, 500);
    } else {
      setRootLoading(false);
    }
  };

  const handleClear = () => {
    setRootInput('');
    setRootPreview(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {t.root.searchRoot}
      </label>
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={rootInput}
          onChange={handleInputChange}
          placeholder={t.root.searchRootPlaceholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-surface text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
        />
        {rootInput && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rootLoading ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </form>

      {/* Live preview card */}
      {rootPreview && !rootLoading && (
        <button
          onClick={() => navigate(`/root/${encodeURIComponent(rootPreview.latin)}`)}
          className="mt-2 w-full text-left p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-foreground leading-none" dir="rtl" lang="ar">
              {rootPreview.arabic}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all font-mono">
              {rootPreview.latin}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {language === 'en' ? rootPreview.mean_en : rootPreview.mean}
          </p>
          <div className="flex flex-wrap gap-1">
            {rootPreview.diffs.slice(0, 4).map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface border border-border text-xs"
              >
                <span dir="rtl" lang="ar" className="font-arabic text-foreground">{d.diff}</span>
                <span className="text-primary font-medium">{d.count}×</span>
              </span>
            ))}
            {rootPreview.diffs.length > 4 && (
              <span className="text-xs text-muted-foreground self-center">+{rootPreview.diffs.length - 4}</span>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
