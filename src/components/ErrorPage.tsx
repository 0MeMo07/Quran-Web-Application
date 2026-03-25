import { useNavigate, useRouteError } from 'react-router-dom';
import { useTranslations } from '../translations';
import { Home } from 'lucide-react';

export function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-2">
            404
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.errors?.pageNotFound || 'Page Not Found'}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-muted-foreground/80">
            {error?.statusText || error?.message || t.errors?.pageNotFoundDesc || 
              'Sorry, we couldn\'t find the page you\'re looking for.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-colors duration-200 gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t.errors?.backToHome || 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );
} 