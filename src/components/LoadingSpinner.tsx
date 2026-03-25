import { Loader2 } from 'lucide-react';
import { useTranslations } from '../translations';

export function LoadingSpinner() {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-surface to-secondary">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{t.loading}</p>
      </div>
    </div>
  );
}