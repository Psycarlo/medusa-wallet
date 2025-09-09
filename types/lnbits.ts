import { z } from 'zod'

import {
  AuthSchema,
  ConfigSchema,
  ConversionSchema,
  PaylinkSchema,
  PaymentSchema,
  RateSchema,
  UserSchema,
  WalletSchema
} from '@/schemas/lnbits'

import { Unpacked } from './utils'

export type Auth = z.infer<typeof AuthSchema>

export type Wallet = z.infer<typeof WalletSchema>

export type Config = z.infer<typeof ConfigSchema>

export type User = z.infer<typeof UserSchema>

export type Payment = z.infer<typeof PaymentSchema>

export type Conversion = z.infer<typeof ConversionSchema>

export type Rate = z.infer<typeof RateSchema>

export type Paylink = Unpacked<z.infer<typeof PaylinkSchema>>
