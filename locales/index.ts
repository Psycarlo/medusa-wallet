import { I18n, TranslateOptions } from 'i18n-js'

import type { SupportedLanguages } from '@/config/language'

import en from './en.json'
import pt from './pt.json'

const i18n = new I18n()

i18n.defaultLocale = 'en'
i18n.locale = 'en'
i18n.enableFallback = true

i18n.store({ en })
i18n.store({ pt })

function changeLocale(locale: SupportedLanguages) {
  i18n.locale = locale
}

const t = (key: string, options?: TranslateOptions) => i18n.t(key, options)

export { changeLocale, i18n, t }
