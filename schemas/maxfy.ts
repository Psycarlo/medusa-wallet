import { z } from 'zod'

const VoucherSchema = z.object({
  id: z.number(),
  active: z.union([z.literal(0), z.literal(1)]),
  title: z.string(),
  fee: z.number(),
  image: z.string().url()
})

export const VouchersSchema = z.object({ vouchers: z.array(VoucherSchema) })

export const CheckoutSchema = z.object({
  txid: z.string(),
  stripe_price: z.string(),
  lnaddress: z.string().email(),
  customer_email: z.string().email(),
  voucher_id: z.number(),
  checkout_url: z.string().url(),
  operation: z.enum(['added_ok'])
})
