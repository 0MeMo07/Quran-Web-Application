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
      className={`sticky top-16 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out ${
        isHeaderVisible
          ? 'max-h-[500px] opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden border-none'
      }`}
    >
      <div className="p-2 sm:p-4">
        <div className="text-center mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {currentSurahName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {pageLabel} {currentPage} {ofLabel} {totalPages}
          </p>
        </div>

        <form onSubmit={onSearchSubmit} className="flex justify-center mb-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:rounded-xl sm:border sm:border-gray-200/70 sm:dark:border-gray-700/70 sm:bg-gray-100/40 sm:dark:bg-gray-800/40 sm:p-1">
            <div className="relative surah-dropdown flex-1 sm:w-56">
              <Input
                type="text"
                value={searchSurah}
                onChange={(e) => onSearchSurahChange(e.target.value)}
                onFocus={onSurahInputFocus}
                placeholder={selectSurahLabel}
                inputSize="sm"
                className="surah-input"
              />
              {showSurahDropdown && (
                <div className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      type="button"
                      onClick={() => onSurahSelect(surah.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    >
                      {surah.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative verse-dropdown w-full sm:w-24 sm:ml-1">
              <Input
                type="text"
                value={searchVerse}
                onChange={(e) => onSearchVerseChange(e.target.value)}
                onFocus={onVerseInputFocus}
                placeholder={verseLabel}
                inputSize="sm"
                className="verse-input"
              />
              {showVerseDropdown && availableVerses.length > 0 && (
                <div className="absolute top-full left-0 w-32 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50">
                  {availableVerses.map((verseNum) => (
                    <button
                      key={verseNum}
                      type="button"
                      onClick={() => onVerseSelect(verseNum)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    >
                      {verseNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" variant="soft" size="icon" className="w-full sm:w-9 sm:h-9 sm:min-w-9 sm:ml-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-gray-700 dark:text-gray-300" />
            </Button>
          </div>
        </form>

        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <Button
            onClick={onPrevPage}
            disabled={currentPage === 0}
            variant="soft"
            size="sm"
            className="px-3 sm:px-4 py-1 sm:py-2 "
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
          </Button>

          <div className="w-12 sm:w-16">
            <Input
              type="text"
              value={inputPage}
              onChange={onPageInputChange}
              onBlur={onPageInputBlur}
              onKeyDown={onPageInputKeyDown}
              inputSize="sm"
              className="text-center px-1 sm:px-2 py-1 text-sm sm:text-base"
            />
          </div>

          <Button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            variant="soft"
            size="sm"
            className="px-3 sm:px-4 py-1 sm:py-2"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}
