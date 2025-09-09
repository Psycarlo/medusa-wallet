import { z } from 'zod'

import { WellKnownSchema } from '@/schemas/lnaddress'

export type WellKnown = z.infer<typeof WellKnownSchema>
