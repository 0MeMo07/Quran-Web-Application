export const GRAMMAR_TERM_MAP: Record<string, { tr: string; en: string }> = {
  isim: { tr: 'İsim', en: 'Noun' },
  fiil: { tr: 'Fiil', en: 'Verb' },
  harf: { tr: 'Harf', en: 'Particle' },
  sifat: { tr: 'Sıfat', en: 'Adjective' },
  zamir: { tr: 'Zamir', en: 'Pronoun' },
  edat: { tr: 'Edat', en: 'Preposition' },
  mecrur: { tr: 'Mecrur', en: 'Genitive' },
  merfu: { tr: 'Merfu', en: 'Nominative' },
  mansub: { tr: 'Mansub', en: 'Accusative' },
  marife: { tr: 'Marife', en: 'Definite' },
  nekre: { tr: 'Nekre', en: 'Indefinite' },
  eril: { tr: 'Eril', en: 'Masculine' },
  disil: { tr: 'Dişil', en: 'Feminine' },
  tekil: { tr: 'Tekil', en: 'Singular' },
  cemi: { tr: 'Çoğul', en: 'Plural' },
  muzari: { tr: 'Muzari', en: 'Present' },
  mazi: { tr: 'Mazi', en: 'Past' },
  emir: { tr: 'Emir', en: 'Imperative' },
};

export const GRAMMAR_EN_TOKEN_MAP: Record<string, string> = {
  isim: 'noun',
  fiil: 'verb',
  harf: 'particle',
  sifat: 'adjective',
  zamir: 'pronoun',
  edat: 'preposition',
  mecrur: 'genitive',
  merfu: 'nominative',
  mansub: 'accusative',
  marife: 'definite',
  nekre: 'indefinite',
  belirsiz: 'indefinite',
  eril: 'masculine',
  disil: 'feminine',
  tekil: 'singular',
  cemi: 'plural',
  cogul: 'plural',
  muzari: 'present',
  mazi: 'past',
  emir: 'imperative',
  zaman: 'time',
  zarf: 'adverb',
  zarfi: 'adverb',
  hal: 'state',
  fail: 'subject',
  meful: 'object',
};

export function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeGrammarKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .replace(/[âàá]/g, 'a')
    .replace(/[îìí]/g, 'i')
    .replace(/[ûùú]/g, 'u')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[’']/g, '');
}

export function toReadableLabel(value: string, language: 'en' | 'tr') {
  const key = normalizeGrammarKey(value);
  const mapped = GRAMMAR_TERM_MAP[key];

  if (mapped) {
    return language === 'en' ? mapped.en : mapped.tr;
  }

  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return '';
  }

  if (language === 'en') {
    const translated = key
      .split(/(\s+|\/|,|\+|-)/)
      .map((part) => {
        const token = part.trim();
        if (!token) {
          return part;
        }
        return GRAMMAR_EN_TOKEN_MAP[token] ?? token;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    return toTitleCase(translated);
  }

  if (language === 'tr') {
    return cleaned.charAt(0).toLocaleUpperCase('tr-TR') + cleaned.slice(1);
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
