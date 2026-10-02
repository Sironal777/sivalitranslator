export type LanguageCode = 'auto' | 'my' | 'en' | 'pi' | 'vi' | 'sa' | 'shn' | 'mnw';

export interface LanguageMeta {
  code: LanguageCode;
  nameEn: string;
  nameMy: string;
  nativeName: string;
  script: string;
  sample: string;
  flagEmoji: string;
  badgeColor: string;
  description: string;
}

export type TranslationTone = 'natural' | 'formal' | 'dhamma';

export interface WordBreakdown {
  word: string;
  meaning: string;
  role: string;
}

export interface ScriptTransliterations {
  myanmarScript?: string;
  devanagariScript?: string;
  shanScript?: string;
  monScript?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLang: string;
  detectedSourceLangName: string;
  romanization?: string;
  scriptTransliterations?: ScriptTransliterations;
  grammarBreakdown?: WordBreakdown[];
  alternativeTranslations?: string[];
  culturalNote?: string;
}

export interface SavedTranslation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  romanization?: string;
  timestamp: number;
  favorite: boolean;
}
