import { Copy, Share, X } from 'lucide-react';
import { useTranslations } from '../translations';
import { useSelector } from 'react-redux';
import { selectSelectedAuthor } from '../store/slices/translationsSlice';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  verseInfo: string;
  verseLink: string;
}

export function ShareMenu({ isOpen, onClose, verseText, verseInfo, verseLink }: ShareMenuProps) {
  const t = useTranslations();
  const selectedAuthor = useSelector(selectSelectedAuthor);

  if (!isOpen) return null;

  // Eğer seçili bir çevirmen varsa URL'ye ekle
  const fullVerseLink = selectedAuthor 
    ? verseLink.includes('verse') 
      ? verseLink.includes(selectedAuthor.id.toString())
        ? verseLink
        : `${verseLink}/${selectedAuthor.id}`
      : `${verseLink}/verse/1/${selectedAuthor.id}`
    : verseLink;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${verseInfo}\n\n${verseText}\n\n${window.location.origin}${fullVerseLink}`
      );
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: verseInfo,
        text: verseText,
        url: `${window.location.origin}${fullVerseLink}`,
      });
      onClose();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm mx-4 bg-surface rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.share.title}
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <Copy className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{t.share.copy}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <Share className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{t.share.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}