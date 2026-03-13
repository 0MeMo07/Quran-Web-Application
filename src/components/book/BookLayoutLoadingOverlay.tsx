import { Loader2 } from 'lucide-react';

interface BookLayoutLoadingOverlayProps {
  isLoading: boolean;
  loadingText: string;
}

export function BookLayoutLoadingOverlay({
  isLoading,
  loadingText,
}: BookLayoutLoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">{loadingText}</p>
      </div>
    </div>
  );
}
