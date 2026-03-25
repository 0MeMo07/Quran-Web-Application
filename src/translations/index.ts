import { useSelector } from 'react-redux';
import { selectSearchLanguage } from '../store/slices/searchSlice';

const translations = {
  en: {
    app: {
      title: 'Quran',
      loading: 'Loading Quran...',
      search: {
        placeholder: 'Search verses, surah names...',
        noResults: 'No results found for',
        minChars: 'Enter at least 2 characters to search or click the shuffle icon for a random verse',
        random: 'Get random verse',
        searching: 'Searching...',
        searchTip: 'You can search for verse text or surah names',
        tryDifferent: 'Try a different search term'
      },
      header: {
        toggleMenu: 'Toggle menu',
        toggleTheme: 'Toggle theme',
        toggleLanguage: 'Toggle language',
        settings: 'Settings',
        themeStyle: 'Theme style',
        currentTheme: 'Current',
        simpleTheme: 'Simple',
        darkMode: 'Dark mode',
        lightMode: 'Light mode',
        notes: 'Notes',
        search: 'Search',
        selectLanguage: 'Select Language',
        menu: 'Menu',
        close: 'Close',
        themes: {
          flagshipLight: 'Flagship Light',
          flagshipDark: 'Flagship Dark',
          simpleLight: 'Simple Light',
          simpleDark: 'Simple Dark'
        }
      },
      sidebar: {
        selectSurah: 'Select Surah',
        selectTranslator: 'Select Translator',
        defaultTranslation: 'Default Translation(Turkish)',
        surahAudio: 'Surah Audio',
        playAudio: 'Play audio',
        pauseAudio: 'Pause audio',
        currentlyPlaying: 'Currently playing',
        readingView: 'Reading View'
      },
      verse: {
        verse: 'Verse',
        juz: 'Juz',
        page: 'Page',
        of: 'of',
        showFootnotes: 'Show footnotes',
        hideFootnotes: 'Hide footnotes',
        footnotes: 'Footnotes',
        audio: {
          play: 'Play verse audio',
          pause: 'Pause verse audio',
          loading: 'Loading audio...'
        }
      },
      share: {
        title: 'Share Verse',
        copy: 'Copy to clipboard',
        share: 'Share',
        copied: 'Copied to clipboard!',
        shareError: 'Unable to share. Your browser may not support sharing.',
        copyError: 'Unable to copy. Please try again.'
      },
      errors: {
        loadingFailed: 'Failed to load content',
        retry: 'Retry',
        audioError: 'Failed to load audio',
        networkError: 'Network error. Please check your connection.',
        pageNotFound: 'Page Not Found',
        pageNotFoundDesc: "Sorry, we couldn't find the page you're looking for.",
        backToHome: 'Back to Home'
      },
      settings: {
        title: 'Text Settings',
        fontSize: 'Font Size',
        lineHeight: 'Line Height',
        smaller: 'Smaller',
        larger: 'Larger',
        lineHeightTight: 'Tight',
        lineHeightRelaxed: 'Relaxed',
        viewType: {
          title: 'View Type',
          mealOnly: 'Translation Only',
          mealAndQuran: 'Translation + Quran',
          quranAndMeal: 'Quran + Translation',
          quranOnly: 'Quran Only'
        }
      },
      notes: {
        addNote: 'Add Note',
        editNote: 'Edit Note',
        placeholder: 'Write your note here...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        noNotes: 'No notes yet',
        savedAt: 'Saved at',
        deleteConfirmation: 'Are you sure you want to delete this note?',
        myNotes: 'My Notes',
        noSearchResults: 'No Search Results',
        tryAnotherSearch: 'Try Another Search',
        startAddingNotes: 'Start Adding Notes',
        startReading: 'Start Reading',
        totalNotes: 'Note',
        searchInNotes: 'Search in Notes...',
        goToBook: 'Book View',
        goToDetail: 'Detailed Analysis'
      },
      root: {
        title: 'Root Word',
        transcription: 'Transcription',
        meaning: 'Meaning',
        forms: 'Forms',
        verses: 'Verses',
        occurrences: 'occurrences',
        page: 'Page',
        of: 'of',
        previous: 'Previous',
        next: 'Next',
        surah: 'Surah',
        verse: 'Verse',
        loading: 'Loading root...',
        notFound: 'Root not found',
        backToHome: 'Back to Home',
        grammaticalInfo: 'Grammatical Info',
        searchRoot: 'Search Root',
        searchRootPlaceholder: 'e.g. Hmd, klm...',
        searchRootBtn: 'Go',
        totalOccurrences: 'Total Occurrences',
        allForms: 'All Forms',
        uniqueSurahs: 'Surahs',
        noVersesFound: 'No verses found for this filter',
        wordInContext: 'Root word in context',
        clearFilter: 'Clear filter',
        showingForm: 'Filtering by form',
        copyVerse: 'Copy verse'
      },
      detail: {
        title: 'Detailed Analysis',
        wordAnalysis: 'Word-by-Word Analysis',
        showAnalysis: 'Show Analysis',
        hideAnalysis: 'Hide Analysis',
        wordCount: 'Words',
        rootCount: 'Roots',
        tapHint: 'Hover/tap words for details',
        root: 'Root',
        noRoot: 'No root',
        transcription: 'Transcription',
        meaning: 'Meaning',
        viewRoot: 'View Root',
        loadingParts: 'Loading words...',
        noPartsAvailable: 'Word analysis not available for this verse.'
      },
      versePage: {
        translations: 'Translations',
        compareTranslations: 'Add another translation',
        addTranslation: 'Add',
        removeTranslation: 'Remove',
        selectAuthor: 'Select translator...',
        prevVerse: 'Previous Verse',
        nextVerse: 'Next Verse',
        backToSurah: 'Back to Surah'
      }
    }
  },
  tr: {
    app: {
      title: 'Kuran',
      loading: 'Kuran yükleniyor...',
      search: {
        placeholder: 'Ayetlerde, sure isimlerinde ara...',
        noResults: 'Sonuç bulunamadı:',
        minChars: 'Arama yapmak için en az 2 karakter girin veya rastgele bir ayet için karıştır simgesine tıklayın',
        random: 'Rastgele ayet getir',
        searching: 'Aranıyor...',
        searchTip: 'Ayet metni veya sure adlarında arama yapabilirsiniz',
        tryDifferent: 'Farklı bir arama terimi deneyin'
      },
      header: {
        toggleMenu: 'Menüyü aç/kapat',
        toggleTheme: 'Temayı değiştir',
        toggleLanguage: 'Dili değiştir',
        settings: 'Ayarlar',
        themeStyle: 'Tema stili',
        currentTheme: 'Mevcut',
        simpleTheme: 'Sade',
        darkMode: 'Karanlık mod',
        lightMode: 'Aydınlık mod',
        notes: 'Notlar',
        search: 'Ara',
        selectLanguage: 'Dil Seçimi',
        menu: 'Menü',
        close: 'Kapat',
        themes: {
          flagshipLight: 'Flagship Aydınlık',
          flagshipDark: 'Flagship Karanlık',
          simpleLight: 'Sade Aydınlık',
          simpleDark: 'Sade Karanlık'
        }
      },
      sidebar: {
        selectSurah: 'Sure Seç',
        selectTranslator: 'Çevirmen Seç',
        defaultTranslation: 'Varsayılan Çeviri(Türkçe)',
        surahAudio: 'Sure Sesi',
        playAudio: 'Sesi oynat',
        pauseAudio: 'Sesi duraklat',
        currentlyPlaying: 'Şu an çalıyor',
        readingView: 'Okuma Görünümü'
      },
      verse: {
        verse: 'Ayet',
        juz: 'Cüz',
        page: 'Sayfa',
        of: '/',
        showFootnotes: 'Dipnotları göster',
        hideFootnotes: 'Dipnotları gizle',
        footnotes: 'Dipnotlar',
        audio: {
          play: 'Ayet sesini oynat',
          pause: 'Ayet sesini duraklat',
          loading: 'Ses yükleniyor...'
        }
      },
      share: {
        title: 'Ayeti Paylaş',
        copy: 'Panoya kopyala',
        share: 'Paylaş',
        copied: 'Panoya kopyalandı!',
        shareError: 'Paylaşılamadı. Tarayıcınız paylaşımı desteklemiyor olabilir.',
        copyError: 'Kopyalanamadı. Lütfen tekrar deneyin.'
      },
      errors: {
        loadingFailed: 'İçerik yüklenemedi',
        retry: 'Tekrar dene',
        audioError: 'Ses yüklenemedi',
        networkError: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.',
        pageNotFound: 'Sayfa Bulunamadı',
        pageNotFoundDesc: 'Üzgünüz, aradığınız sayfayı bulamadık.',
        backToHome: 'Ana Sayfaya Dön'
      },
      settings: {
        title: 'Yazı Ayarları',
        fontSize: 'Yazı Boyutu',
        lineHeight: 'Satır Aralığı',
        smaller: 'Küçült',
        larger: 'Büyüt',
        lineHeightTight: 'Sık',
        lineHeightRelaxed: 'Rahat',
        viewType: {
          title: 'Görünüm',
          mealOnly: 'Sadece Meal',
          mealAndQuran: 'Meal + Kuran',
          quranAndMeal: 'Kuran + Meal',
          quranOnly: 'Sadece Kuran'
        }
      },
      notes: {
        addNote: 'Not Ekle',
        editNote: 'Notu Düzenle',
        placeholder: 'Notunuzu buraya yazın...',
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        noNotes: 'Henüz not eklenmemiş',
        savedAt: 'Kaydedilme zamanı',
        deleteConfirmation: 'Bu notu silmek istediğinize emin misiniz?',
        myNotes: 'Notlarım',
        noSearchResults: 'Arama Sonucu Bulunamadı',
        tryAnotherSearch: 'Başka bir arama yapmayı deneyin',
        startAddingNotes: 'Okumaya başlayın ve ayetlere not ekleyin',
        startReading: 'Okumaya Başla',
        totalNotes: 'Not',
        searchInNotes: 'Notlarda ara...',
        goToBook: 'Kitap Görünümü',
        goToDetail: 'Detaylı İnceleme'
      },
      root: {
        title: 'Kök Kelime',
        transcription: 'Transkripsiyon',
        meaning: 'Anlam',
        forms: 'Formlar',
        verses: 'Ayetler',
        occurrences: 'kez',
        page: 'Sayfa',
        of: '/',
        previous: 'Önceki',
        next: 'Sonraki',
        surah: 'Sure',
        verse: 'Ayet',
        loading: 'Kök yükleniyor...',
        notFound: 'Kök bulunamadı',
        backToHome: 'Ana Sayfaya Dön',
        grammaticalInfo: 'Dilbilgisi Bilgisi',
        searchRoot: 'Kök Ara',
        searchRootPlaceholder: 'ör. Hmd, klm...',
        searchRootBtn: 'Git',
        totalOccurrences: 'Toplam Kullanım',
        allForms: 'Tüm Formlar',
        uniqueSurahs: 'Sure',
        noVersesFound: 'Bu filtre için ayet bulunamadı',
        wordInContext: 'Bağlamdaki kök kelime',
        clearFilter: 'Filtreyi temizle',
        showingForm: 'Forma göre filtre',
        copyVerse: 'Ayeti kopyala'
      },
      detail: {
        title: 'Detaylı Analiz',
        wordAnalysis: 'Kelime Kelime Analiz',
        showAnalysis: 'Analizi Göster',
        hideAnalysis: 'Analizi Gizle',
        wordCount: 'Kelime',
        rootCount: 'Kök',
        tapHint: 'Detaylar için kelimelerin üzerine gelin veya dokunun',
        root: 'Kök',
        noRoot: 'Kök yok',
        transcription: 'Transkripsiyon',
        meaning: 'Anlam',
        viewRoot: 'Köke Git',
        loadingParts: 'Kelimeler yükleniyor...',
        noPartsAvailable: 'Bu ayet için kelime analizi mevcut değil.'
      },
      versePage: {
        translations: 'Çeviriler',
        compareTranslations: 'Başka çeviri ekle',
        addTranslation: 'Ekle',
        removeTranslation: 'Kaldır',
        selectAuthor: 'Çevirmen seç...',
        prevVerse: 'Önceki Ayet',
        nextVerse: 'Sonraki Ayet',
        backToSurah: 'Sureye Dön'
      }
    }
  }
};

export type TranslationKey = keyof typeof translations.en.app;

export function useTranslations() {
  const language = useSelector(selectSearchLanguage) as 'en' | 'tr';
  return translations[language].app;
}

export function getTranslation(language: 'en' | 'tr', key: string) {
  return key.split('.').reduce((obj, key) => obj[key], translations[language] as any);
}