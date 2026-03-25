import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { IconButton } from '../ui';

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
      <IconButton
        onClick={onToggleSettings}
        className="bg-surface shadow-md hover:shadow-lg"
        title="Settings"
        icon={<Settings className={`w-5 h-5 text-muted-foreground transition-transform ${showSettings ? 'rotate-45' : ''}`} />}
      />
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
    </div>
  );
}
