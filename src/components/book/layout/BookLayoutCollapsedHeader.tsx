import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../../ui';

interface BookLayoutCollapsedHeaderProps {
  isHeaderVisible: boolean;
  currentSurahName: string;
  pageLabel: string;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function BookLayoutCollapsedHeader({
  isHeaderVisible,
  currentSurahName,
  pageLabel,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: BookLayoutCollapsedHeaderProps) {
  return (
    <div
      className={`sticky top-16 bg-surface/95 backdrop-blur-md z-10 transition-all duration-500 ${
        isHeaderVisible
          ? 'max-h-0 opacity-0 overflow-hidden'
          : 'max-h-16 opacity-100 border-b border-border'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {currentSurahName} - {pageLabel} {currentPage}
        </h2>
        <div className="flex gap-2">
          <IconButton
            onClick={onPrevPage}
            disabled={currentPage === 0}
            variant="ghost"
            className="!p-1 !rounded hover:bg-secondary"
            icon={<ChevronLeft className="w-4 h-4 text-muted-foreground" />}
          />
          <IconButton
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            variant="ghost"
            className="!p-1 !rounded hover:bg-secondary"
            icon={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          />
        </div>
      </div>
    </div>
  );
}
