import { z } from 'zod'

import {
  SUPPORTED_FIAT_CURRENCIES,
  type SupportedFiatCurrencies
} from '@/config/fiat'

export const TimestampPriceSchema = z.object({
  unix_time: z.number(),
  bitcoin: z.strictObject(
    SUPPORTED_FIAT_CURRENCIES.reduce(
      (acc, currency) => {
        acc[currency] = z.number()
        return acc
      },
      {} as Record<SupportedFiatCurrencies, z.ZodNumber>
    )
  )
})
