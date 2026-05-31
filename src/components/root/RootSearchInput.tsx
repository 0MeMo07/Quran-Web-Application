import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../translations';

interface RootSearchInputProps {
  currentLatin: string;
}

export function RootSearchInput({ currentLatin }: RootSearchInputProps) {
  const [val, setVal] = useState('');
  const navigate = useNavigate();
  const t = useTranslations();

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const v = val.trim();
    if (v && v.toLowerCase() !== currentLatin.toLowerCase()) {
      navigate(`/root/${encodeURIComponent(v)}`);
      setVal('');
    }
  };

  return (
    <form onSubmit={go} className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={t.root.searchRootPlaceholder}
          className="pl-8 pr-3 py-1.5 text-sm w-full sm:w-44 bg-secondary rounded-lg border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder-muted-foreground transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={!val.trim()}
        className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-40 transition-colors shrink-0"
      >
        {t.root.searchRootBtn}
      </button>
    </form>
  );
}
