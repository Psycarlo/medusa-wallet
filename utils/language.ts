import type { SupportedLanguages } from '@/config/language'
import { t } from '@/locales'

function getName(language: SupportedLanguages) {
  return t(`languages.${language}`)
}

export default { getName }
