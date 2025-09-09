import { z } from 'zod'

import { SUPPORTED_FIAT_CURRENCIES } from '@/config/fiat'

export const ValidationErrorSchema = z.object({
  detail: z.union([
    z.array(
      z.object({
        loc: z.array(z.union([z.string(), z.number().int()])),
        msg: z.string(),
        type: z.string()
      })
    ),
    z.string()
  ])
})

export const AuthSchema = z.object({
  access_token: z.string().jwt()
})

export const WalletSchema = z.object({
  id: z.string(),
  name: z.string(),
  adminkey: z.string(),
  inkey: z.string(),
  balance_msat: z.number(),
  user: z.string(),
  currency: z.string().optional().nullable(),
  deleted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
})

export const ExtraSchema = z.object({
  email_verified: z.boolean().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  display_name: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  provider: z.string().optional().nullable()
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().optional().nullable(),
  username: z.string(),
  extensions: z.array(z.string()).default([]),
  wallets: z.array(WalletSchema).default([]),
  admin: z.boolean().default(false),
  super_user: z.boolean().default(false),
  has_password: z.boolean().default(false),
  extra: ExtraSchema.optional().nullable()
})

export const PaymentSchema = z.object({
  status: z.string(),
  checking_id: z.string(),
  amount: z.number(),
  fee: z.number(),
  memo: z.string(),
  time: z.string(),
  bolt11: z.string(),
  preimage: z.string().optional().nullable(),
  payment_hash: z.string(),
  expiry: z.string().optional().nullable(),
  object: z.record(z.any()).default({}),
  wallet_id: z.string(),
  webhook: z.string().optional().nullable(),
  webhook_status: z.number().optional().nullable()
})

export const ConversionSchema = z
  .object({
    BTC: z.number(),
    sats: z.number()
  })
  .and(
    z
      .record(z.enum(SUPPORTED_FIAT_CURRENCIES), z.number())
      .refine((data) => Object.keys(data).length === 1)
  )

export const RateSchema = z.object({
  rate: z.number()
})

export const InvoiceSchema = z.object({
  payment_hash: z.string(),
  bolt11: z.string(),
  checking_id: z.string(),
  memo: z.string().optional().nullable(),
  amount: z.number()
})

export const WebsocketSchema = z.object({
  pending: z.boolean().optional(),
  paid: z.boolean().optional()
})

export const InkeyWebsocketSchema = z.object({
  payment: z
    .object({
      amount: z.number().optional(),
      status: z.string().optional()
    })
    .optional()
})

export const PayInvoiceSchema = z.object({
  checking_id: z.string(),
  payment_hash: z.string()
})

export const LnurlSchema = z.object({
  lnurl: z.string()
})

export const PaylinkSchema = z.array(
  z.object({
    id: z.string(),
    wallet: z.string(),
    description: z.string(),
    min: z.number(),
    max: z.number(),
    username: z.string(),
    comment_chars: z.number(),
    lnurl: z.string()
  })
)
