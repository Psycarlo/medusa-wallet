import { z } from 'zod'

import {
  SUPPORTED_FIAT_CURRENCIES,
  type SupportedFiatCurrencies
} from '@/config/fiat'

export const HistoricalPriceSchema = z.object({
  prices: z.array(
    z
      .object({
        time: z.number(),
        USD: z.number()
      })
      .extend(
        SUPPORTED_FIAT_CURRENCIES.reduce(
          (acc, currency) => {
            acc[currency] = z.number().optional()
            return acc
          },
          {} as Record<SupportedFiatCurrencies, z.ZodOptional<z.ZodNumber>>
        )
      )
      .refine((data) => {
        // Ensure that exactly one of the fiat currencies is present (other than USD)
        const currencyKeys = SUPPORTED_FIAT_CURRENCIES.filter(
          (currency) => currency.toUpperCase() !== 'USD' && !!data[currency]
        )
        return currencyKeys.length <= 1
      })
  ),
  exchangeRates: z.record(z.string(), z.number())
})
