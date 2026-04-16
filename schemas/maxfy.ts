import { z } from 'zod'

const VoucherSchema = z.object({
  id: z.number(),
  active: z.union([z.literal(0), z.literal(1)]),
  title: z.string(),
  fee: z.number(),
  image: z.string().url()
})

export const VouchersSchema = z.object({ vouchers: z.array(VoucherSchema) })

export const CheckoutPISchema = z.object({
  txid: z.string(),
  customer_email: z.string().email(),
  lnaddress: z.string().email(),
  voucher_id: z.number(),
  payment_intent_id: z.string(),
  client_secret: z.string(),
  operation: z.enum(['added_ok'])
})
