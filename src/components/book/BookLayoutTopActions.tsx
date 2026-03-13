import { ChevronUp, ChevronDown, Settings } from 'lucide-react';

interface BookLayoutTopActionsProps {
  isHeaderVisible: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
  onToggleHeaderVisible: () => void;
}

export function BookLayoutTopActions({
  isHeaderVisible,
  showSettings,
  onToggleSettings,
  onToggleHeaderVisible,
}: BookLayoutTopActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-2">
      <button
        onClick={onToggleSettings}
        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
        title="Settings"
      >
        <Settings className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${showSettings ? 'rotate-45' : ''}`} />
      </button>
      <button
        onClick={onToggleHeaderVisible}
        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
        title={isHeaderVisible ? 'Hide controls' : 'Show controls'}
      >
        {isHeaderVisible ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:-translate-y-0.5 transition-transform" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:translate-y-0.5 transition-transform" />
        )}
      </button>
    </div>
  );
}
