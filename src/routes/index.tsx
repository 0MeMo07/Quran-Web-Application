import { createBrowserRouter } from 'react-router-dom';
import { VersePage } from './VersePage';
import { NotesPage } from './NotesPage';
import { RootPage } from './RootPage';
import App from '../App';
import { ErrorPage } from '../components/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId/page/:pageNumber',
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId/verse/:verseId',
    element: <VersePage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/surah/:surahId/verse/:verseId/:authorId',
    element: <VersePage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/notes',
    element: <NotesPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/root/:latin',
    element: <RootPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]); 