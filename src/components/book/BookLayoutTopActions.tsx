import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { IconButton } from '../ui';
import { type LayoutType } from '../../store/slices/uiSlice';

interface BookLayoutTopActionsProps {
  isHeaderVisible: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
  onToggleHeaderVisible: () => void;
  layoutType?: LayoutType;
}

export function BookLayoutTopActions({
  isHeaderVisible,
  showSettings,
  onToggleSettings,
  onToggleHeaderVisible,
  layoutType,
}: BookLayoutTopActionsProps) {
  const isFlipBook = layoutType === 'flipbook';

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3">
      <button
        onClick={onToggleSettings}
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
          isFlipBook 
            ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white shadow-2xl' 
            : 'bg-surface shadow-md hover:shadow-lg text-muted-foreground'
        }`}
        title="Settings"
      >
        <Settings className={`w-5 h-5 transition-transform duration-500 origin-center ${showSettings ? 'rotate-90 text-primary' : ''}`} />
      </button>

      {!isFlipBook && (
        <IconButton
          onClick={onToggleHeaderVisible}
          className="bg-surface shadow-md hover:shadow-lg"
          title={isHeaderVisible ? 'Hide controls' : 'Show controls'}
          icon={
            isHeaderVisible ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:translate-y-0.5 transition-transform" />
            )
          }
        />
      )}
    </div>
  );
}
