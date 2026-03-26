import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button, Input } from '../ui';

interface SurahOption {
  id: number;
  name: string;
}

interface BookLayoutExpandedHeaderProps {
  isHeaderVisible: boolean;
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
  return (
    <div
      className={`sticky top-16 bg-surface/95 backdrop-blur-md z-10 border-b border-border transition-all duration-500 ease-in-out ${
        isHeaderVisible
          ? 'max-h-[500px] opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden border-none'
      }`}
    >
      <div className="p-2 sm:px-4 sm:py-4">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            {currentSurahName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {pageLabel} {currentPage} {ofLabel} {totalPages}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          <form onSubmit={onSearchSubmit} className="flex justify-center w-full">
            <div className="flex items-center gap-2">
              <div className="relative surah-dropdown w-40 sm:w-56">
                <Input
                  type="text"
                  value={searchSurah}
                  onChange={(e) => onSearchSurahChange(e.target.value)}
                  onFocus={onSurahInputFocus}
                  placeholder={selectSurahLabel}
                  inputSize="sm"
                  className="surah-input h-9 sm:h-10 bg-secondary/30"
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

              <div className="relative verse-dropdown w-20 sm:w-24">
                <Input
                  type="text"
                  value={searchVerse}
                  onChange={(e) => onSearchVerseChange(e.target.value)}
                  onFocus={onVerseInputFocus}
                  placeholder={verseLabel}
                  inputSize="sm"
                  className="verse-input h-9 sm:h-10 bg-secondary/30"
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
              <Button type="submit" variant="soft" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 min-w-9 bg-secondary/30">
                <Search className="w-4 h-4 mx-auto text-muted-foreground" />
              </Button>
            </div>
          </form>

          <div className="flex justify-center items-center gap-4 sm:gap-6">
            <Button
              onClick={onPrevPage}
              disabled={currentPage === 0}
              variant="soft"
              size="sm"
              className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-secondary/30"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Button>

            <div className="w-14 sm:w-16">
              <Input
                type="text"
                value={inputPage}
                onChange={onPageInputChange}
                onBlur={onPageInputBlur}
                onKeyDown={onPageInputKeyDown}
                inputSize="sm"
                className="text-center h-9 sm:h-10 px-1 text-sm bg-secondary/30 font-medium"
              />
            </div>

            <Button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              variant="soft"
              size="sm"
              className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-secondary/30"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
