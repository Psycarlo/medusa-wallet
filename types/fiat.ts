import type { SupportedFiatCurrencies } from '@/config/fiat'

export type FiatSnapshot = Record<SupportedFiatCurrencies, number>
