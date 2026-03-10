import { useNavigate, useRouteError } from 'react-router-dom';
import { useTranslations } from '../translations';
import { Home } from 'lucide-react';

export function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t.errors?.pageNotFound || 'Page Not Found'}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 dark:text-gray-400">
            {error?.statusText || error?.message || t.errors?.pageNotFoundDesc || 
              'Sorry, we couldn\'t find the page you\'re looking for.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t.errors?.backToHome || 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );
} 