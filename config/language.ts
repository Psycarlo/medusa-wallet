export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const
export type SupportedLanguages = (typeof SUPPORTED_LANGUAGES)[number]

type LanguageDetails = {
  name: string
  emoji: string
  code: string
}

export const languageDictionary: Record<SupportedLanguages, LanguageDetails> = {
  en: {
    name: 'English',
    emoji: '🇬🇧🇺🇸',
    code: 'en'
  },
  pt: {
    name: 'Portuguese',
    emoji: '🇵🇹🇧🇷',
    code: 'pt'
  }
}
