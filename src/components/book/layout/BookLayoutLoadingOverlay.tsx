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
    <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-10">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
}
