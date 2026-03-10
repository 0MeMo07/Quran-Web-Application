import { Loader2 } from 'lucide-react';
import { useTranslations } from '../translations';

export function LoadingSpinner() {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
      </div>
    </div>
  );
}