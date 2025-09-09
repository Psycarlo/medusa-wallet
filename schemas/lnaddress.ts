import { z } from 'zod'

const WellKnownMetadataSchema = z.array(z.tuple([z.string(), z.string()]))

export const WellKnownSchema = z.object({
  callback: z.string().optional().nullable(),
  maxSendable: z.number().optional().nullable(),
  minSendable: z.number().optional().nullable(),
  commentAllowed: z.number().optional().nullable(),
  metadata: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (!val) return z.NEVER
      try {
        const parsed = JSON.parse(val)
        return WellKnownMetadataSchema.parse(parsed)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid metadata JSON string'
        })
        return z.NEVER
      }
    })
})
