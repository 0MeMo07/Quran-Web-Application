import { useSelector } from 'react-redux';
import { selectReadingType } from '../store/slices/uiSlice';
import { selectAllVerses } from '../store/slices/quranSlice';
import { BookLayout } from '../components/BookLayout';
import { VerseCard } from '../components/VerseCard';

export function HomePage() {
  const readingType = useSelector(selectReadingType);
  const allVerses = useSelector(selectAllVerses);

  if (readingType === 'book') {
    return <BookLayout verses={allVerses} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {allVerses.map((verse) => (
        <VerseCard key={verse.id} verse={verse} />
      ))}
    </div>
  );
} 