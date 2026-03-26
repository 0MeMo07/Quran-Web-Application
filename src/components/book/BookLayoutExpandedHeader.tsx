import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button, Input } from '../ui';
import type { LayoutType } from '../../store/slices/uiSlice';

interface SurahOption {
  id: number;
  name: string;
}

interface BookLayoutExpandedHeaderProps {
  isHeaderVisible: boolean;
  layoutType: LayoutType;
  currentSurahName: string;
  currentPage: number;
  totalPages: number;
  pageLabel: string;
  ofLabel: string;
  selectSurahLabel: string;
  verseLabel: string;
  searchSurah: string;
  searchVerse: string;
  showSurahDropdown: boolean;
  showVerseDropdown: boolean;
  filteredSurahs: SurahOption[];
  availableVerses: number[];
  inputPage: string;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchSurahChange: (value: string) => void;
  onSearchVerseChange: (value: string) => void;
  onSurahInputFocus: () => void;
  onVerseInputFocus: () => void;
  onSurahSelect: (surahName: string) => void;
  onVerseSelect: (verseNumber: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function BookLayoutExpandedHeader({
  isHeaderVisible,
  layoutType,
  currentSurahName,
  currentPage,
  totalPages,
  pageLabel,
  ofLabel,
  selectSurahLabel,
  verseLabel,
  searchSurah,
  searchVerse,
  showSurahDropdown,
  showVerseDropdown,
  filteredSurahs,
  availableVerses,
  inputPage,
  onSearchSubmit,
  onSearchSurahChange,
  onSearchVerseChange,
  onSurahInputFocus,
  onVerseInputFocus,
  onSurahSelect,
  onVerseSelect,
  onPrevPage,
  onNextPage,
  onPageInputChange,
  onPageInputBlur,
  onPageInputKeyDown,
}: BookLayoutExpandedHeaderProps) {
  const isCompact = layoutType === 'flipbook';

  return (
    <div
      className={`sticky top-16 bg-surface/95 backdrop-blur-md z-10 border-b border-border transition-all duration-500 ease-in-out ${
        isHeaderVisible
          ? isCompact ? 'max-h-[120px] opacity-100' : 'max-h-[500px] opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden border-none'
      }`}
    >
      <div className={`p-2 sm:px-4 ${isCompact ? 'sm:py-2' : 'sm:py-4'}`}>
        {!isCompact && (
          <div className="text-center mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {currentSurahName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {pageLabel} {currentPage} {ofLabel} {totalPages}
            </p>
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${isCompact ? 'sm:gap-6' : ''}`}>
          <form onSubmit={onSearchSubmit} className={`flex justify-center ${isCompact ? 'mb-0' : 'mb-4 sm:mb-0'}`}>
            <div className="w-full sm:w-auto flex items-center gap-1 sm:rounded-xl sm:bg-secondary/40 sm:p-1">
              <div className="relative surah-dropdown w-32 sm:w-48">
                <Input
                  type="text"
                  value={searchSurah}
                  onChange={(e) => onSearchSurahChange(e.target.value)}
                  onFocus={onSurahInputFocus}
                  placeholder={isCompact ? currentSurahName : selectSurahLabel}
                  inputSize="sm"
                  className="surah-input h-8 sm:h-9"
                />
                {showSurahDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-surface border border-border rounded shadow-lg z-50">
                    {filteredSurahs.map((surah) => (
                      <button
                        key={surah.id}
                        type="button"
                        onClick={() => onSurahSelect(surah.name)}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-foreground text-sm"
                      >
                        {surah.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative verse-dropdown w-16 sm:w-20">
                <Input
                  type="text"
                  value={searchVerse}
                  onChange={(e) => onSearchVerseChange(e.target.value)}
                  onFocus={onVerseInputFocus}
                  placeholder={verseLabel}
                  inputSize="sm"
                  className="verse-input h-8 sm:h-9"
                />
                {showVerseDropdown && availableVerses.length > 0 && (
                  <div className="absolute top-full left-0 w-24 mt-1 max-h-60 overflow-y-auto bg-surface border border-border rounded shadow-lg z-50">
                    {availableVerses.map((verseNum) => (
                      <button
                        key={verseNum}
                        type="button"
                        onClick={() => onVerseSelect(verseNum)}
                        className="w-full px-3 py-2 text-left hover:bg-secondary text-foreground text-sm"
                      >
                        {verseNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" variant="soft" size="icon" className="w-8 h-8 sm:w-9 sm:h-9 min-w-8">
                <Search className="w-3.5 h-3.5 sm:w-4 h-4 mx-auto text-muted-foreground" />
              </Button>
            </div>
          </form>

          <div className="flex justify-center items-center gap-2 sm:gap-3">
            <Button
              onClick={onPrevPage}
              disabled={currentPage === 0}
              variant="soft"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Button>

            <div className="w-12 sm:w-14">
              <Input
                type="text"
                value={inputPage}
                onChange={onPageInputChange}
                onBlur={onPageInputBlur}
                onKeyDown={onPageInputKeyDown}
                inputSize="sm"
                className="text-center h-8 sm:h-9 px-1 text-sm"
              />
            </div>

            <Button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              variant="soft"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            {isCompact && (
              <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-2">
                /{totalPages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
