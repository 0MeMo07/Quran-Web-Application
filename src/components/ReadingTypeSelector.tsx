import { Book, AlignVerticalSpaceAround, Microscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectReadingType, setReadingType, ReadingType } from '../store/slices/uiSlice';
import { useTranslations } from '../translations/index';

export function ReadingTypeSelector() {
  const dispatch = useDispatch();
  const currentType = useSelector(selectReadingType) as ReadingType;
  const t = useTranslations();

  const options: { id: ReadingType; icon: any; title: string }[] = [
    { id: 'book', icon: Book, title: 'Kitap' },
    { id: 'card', icon: AlignVerticalSpaceAround, title: 'Kart' },
    { id: 'detail', icon: Microscope, title: 'Detay' },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-3 px-1">
        {t.sidebar.readingView}
      </label>
      <div className="flex items-center gap-1 p-1 bg-secondary/50 backdrop-blur-md rounded-xl relative overflow-hidden border border-border shadow-inner">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => dispatch(setReadingType(option.id))}
            className={`relative flex-1 p-2.5 rounded-lg transition-colors flex items-center justify-center z-10 ${
              currentType === option.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <option.icon className={`w-4 h-4 transition-transform ${currentType === option.id ? 'scale-110' : ''}`} />
            {currentType === option.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-surface/80 dark:bg-primary/10 shadow-sm rounded-lg -z-10 border border-border opacity-20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="absolute inset-0"
            />
          </button>
        ))}
      </div>
    </div>
  );
}