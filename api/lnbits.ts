import { z } from 'zod'

import { SupportedFiatCurrencies } from '@/config/fiat'
import {
  PAYLINK_COMMENT_CHARS,
  PAYLINK_DESCRIPTION,
  PAYLINK_MAX,
  PAYLINK_MIN
} from '@/config/paylink'
import { PAYMENTS_PER_FETCH } from '@/config/payments'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import {
  AuthSchema,
  AutoSwapSchema,
  BoltzConfigurationSchema,
  InkeyWebsocketSchema,
  InvoiceSchema,
  LnurlPayCallbackSchema,
  LnurlSchema,
  PaylinkSchema,
  PaymentSchema,
  RateSchema,
  SwapSchema,
  UserSchema,
  ValidationErrorSchema,
  WalletSchema,
  WebsocketSchema
} from '@/schemas/lnbits'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import type { FiatSnapshot } from '@/types/fiat'
import type { Payment } from '@/types/lnbits'
import bolt11 from '@/utils/bolt11'
import { getHistoricalPricesMap } from '@/utils/medusa'
import parse from '@/utils/parse'
import { generateRandomAddress } from '@/utils/random'
import { tryCatch } from '@/utils/tryCatch'
import { normalizeBaseUrl } from '@/utils/url'

import medusa from './medusa'

const headers = { 'Content-Type': 'application/json' }

// Normalized here too: URLs saved with a trailing slash by older versions
function getCurrentBaseUrl() {
  return normalizeBaseUrl(useSettingsStore.getState().lnbitsUrl)
}

// User-level endpoints (wallet create/delete, auth) require the access token
// since LNbits v1. Older versions accept the admin key instead, so we send both.
function authHeaders(
  accessToken = useAuthStore.getState().accessToken
): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

// Price API expects unix seconds
function toUnixSeconds(date: string) {
  return Math.floor(new Date(date).getTime() / 1000)
}

async function register(username: string, email: string, password: string) {
  const { data, error } = await tryCatch(
    fetch(`${getCurrentBaseUrl()}/api/v1/auth/register`, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        password_repeat: password
      })
    })
  )

  if (error) throw new Error('Something went wrong. Please try again later.')

  const json = await data.json()

  const { data: authData, error: authError } = AuthSchema.safeParse(json)

  if (authError) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  const { data: userData, error: userError } = await tryCatch(
    getUser(authData.access_token)
  )

  if (userError || !userData) throw new Error('User not found')
  if (!userData.wallets[0]?.adminkey)
    throw new Error('Default wallet not created')

  const { error: paylinkError } = await tryCatch(
    createPaylink(userData.wallets[0].adminkey)
  )

  if (paylinkError) throw new Error('Unable to create user paylink')

  return authData.access_token
}

async function login(username: string, password: string) {
  const { data, error } = await tryCatch(
    fetch(`${getCurrentBaseUrl()}/api/v1/auth`, {
      headers,
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  )

  if (error) throw new Error('Something went wrong. Please try again later.')

  const json = await data.json()

  const { data: authData, error: authError } = AuthSchema.safeParse(json)

  if (authError) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return authData.access_token
}

async function createPaylink(adminKey: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/lnurlp/api/v1/links`, {
    headers: {
      ...headers,
      'x-api-key': adminKey
    },
    method: 'POST',
    body: JSON.stringify({
      description: PAYLINK_DESCRIPTION,
      min: PAYLINK_MIN,
      max: PAYLINK_MAX,
      username: generateRandomAddress(),
      comment_chars: PAYLINK_COMMENT_CHARS
    })
  })
  const json = await response.json()

  const { data, error } = LnurlSchema.safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data.lnurl
}

async function getPaylinks(inkey: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/lnurlp/api/v1/links`, {
    headers: {
      ...headers,
      'x-api-key': inkey
    },
    method: 'GET'
  })
  const json = await response.json()

  const { data, error } = PaylinkSchema.safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data
    .filter((paylink) => !!paylink.username)
    .map((paylink) => parse.fromLnbitsPaylinkToPaylink(paylink))
}

// Session is no longer valid (as opposed to network or server errors)
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

async function getUser(accessToken: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/api/v1/auth`, {
    headers: {
      ...headers,
      ...authHeaders(accessToken),
      Cookie: `cookie_access_token=${accessToken}`
    },
    method: 'GET'
  })

  if (response.status === 401 || response.status === 403)
    throw new UnauthorizedError()

  const json = await response.json()

  const { data, error } = UserSchema.safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  const parsedWallets = data.wallets.map(parse.fromLnbitsWalletToWallet)

  const parsedUser = {
    username: data.username,
    email: data.email,
    wallets: parsedWallets,
    totalBalance: parsedWallets.reduce(
      (total, wallet) => total + wallet.balance,
      0
    )
  }

  return parsedUser
}

async function getLnbitsRate(fiat: SupportedFiatCurrencies) {
  const response = await fetch(`${getCurrentBaseUrl()}/api/v1/rate/${fiat}`, {
    headers
  })
  const json = await response.json()

  return RateSchema.parse(json).rate
}

/**
 * Sats per unit of `fiat`. LNbits only serves the currencies its admin
 * allowed (`/api/v1/currencies`), so the others come from the Medusa API.
 */
async function rate(fiat: SupportedFiatCurrencies) {
  const { data: lnbitsRate } = await tryCatch(getLnbitsRate(fiat))
  if (lnbitsRate) return lnbitsRate

  const prices = await medusa.getBitcoinPricesAt(Math.floor(Date.now() / 1000))
  if (!prices[fiat]) throw new Error('Rate not loaded')

  return SATOSHIS_IN_BITCOIN / prices[fiat]
}

type GetPaginatedPaymentsOptions = {
  limit?: number
  offset?: number
  walletId?: string
}

// TODO: Implement https://github.com/lnbits/lnbits/pull/3132
async function getPaginatedPayments(
  inkey: string,
  {
    limit = PAYMENTS_PER_FETCH,
    offset = 0,
    walletId = undefined
  }: GetPaginatedPaymentsOptions = {},
  snapshots: Record<string, FiatSnapshot> = {},
  addSnapshot: (timestamp: string, snapshot: FiatSnapshot) => void
) {
  const url = new URL(`${getCurrentBaseUrl()}/api/v1/payments`)
  url.searchParams.append('status', 'success')
  url.searchParams.append('direction', 'desc')
  url.searchParams.append('limit', String(limit))
  url.searchParams.append('offset', String(offset))
  if (walletId) url.searchParams.append('wallet_id', walletId)

  const response = await fetch(url.toString(), {
    headers: {
      ...headers,
      'x-api-key': inkey
    },
    method: 'GET'
  })
  const json = await response.json()

  const PaymentsArraySchema = z.array(PaymentSchema)
  const { data, error } = PaymentsArraySchema.safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  const historicalPricesMap = getHistoricalPricesMap(
    data.map((payment) => ({
      id: payment.payment_hash,
      timestamp: toUnixSeconds(payment.time)
    }))
  )

  const fiatSnapshotForIds = await getFiatSnapshots(
    historicalPricesMap,
    snapshots,
    addSnapshot
  )

  return data
    .map((payment) => parse.fromLnbitsPaymentToTransaction(payment))
    .map((transaction) => {
      const snapshot = fiatSnapshotForIds[transaction.id]
      if (!snapshot) return transaction
      return {
        ...transaction,
        fiatSnapshot: Object.fromEntries(
          Object.entries(snapshot).map(([fiat, btcPrice]) => [
            fiat,
            Number(
              ((transaction.sats / SATOSHIS_IN_BITCOIN) * btcPrice).toFixed(2)
            )
          ])
        ) as FiatSnapshot
      }
    })
}

// Bitcoin prices at each payment time, fetched in parallel and cached.
// A failed lookup only leaves those payments without a fiat value.
async function getFiatSnapshots(
  historicalPricesMap: Record<number, string[]>,
  snapshots: Record<string, FiatSnapshot>,
  addSnapshot: (timestamp: string, snapshot: FiatSnapshot) => void
) {
  const entries = Object.entries(historicalPricesMap)

  const results = await Promise.allSettled(
    entries.map(async ([timestamp]) => {
      if (snapshots[timestamp]) return snapshots[timestamp]
      const snapshot = await medusa.getBitcoinPricesAt(Number(timestamp))
      addSnapshot(timestamp, snapshot)
      return snapshot
    })
  )

  const fiatSnapshotForIds: Record<string, FiatSnapshot> = {}
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return
    for (const id of entries[index][1]) fiatSnapshotForIds[id] = result.value
  })

  return fiatSnapshotForIds
}

// TODO: getPaymentByHash

// Ignores malformed messages instead of throwing inside the event handler
function parseWebsocketMessage<T>(data: unknown, schema: z.ZodType<T>) {
  try {
    const result = schema.safeParse(JSON.parse(String(data)))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

function subscribePaymentWs(
  paymentHash: Payment['payment_hash'],
  callback: () => void
) {
  const url = new URL(`${getCurrentBaseUrl()}/api/v1`)
  url.protocol = 'wss'
  url.pathname = `/api/v1/ws/${paymentHash}`

  const webSocket = new WebSocket(url.toString())
  webSocket.addEventListener('message', ({ data }) => {
    const parsedData = parseWebsocketMessage(data, WebsocketSchema)
    if (!parsedData) return

    if (parsedData.paid === true || parsedData.pending === false) {
      callback()
      webSocket.close()
    }
  })

  return webSocket
}

function subscribeInkeyWs(inkey: string, callback: (amount: number) => void) {
  const url = new URL(`${getCurrentBaseUrl()}/api/v1`)
  url.protocol = 'wss'
  url.pathname = `/api/v1/ws/${inkey}`

  const webSocket = new WebSocket(url.toString())
  webSocket.addEventListener('message', ({ data }) => {
    const parsedData = parseWebsocketMessage(data, InkeyWebsocketSchema)
    if (!parsedData) return

    if (
      parsedData.payment?.status === 'success' &&
      parsedData.payment?.amount
    ) {
      callback(parsedData.payment.amount / 1000)
    }
  })

  return webSocket
}

async function createWallet(name: string, adminkey: string) {
  try {
    const response = await fetch(`${getCurrentBaseUrl()}/api/v1/wallet`, {
      headers: {
        ...headers,
        ...authHeaders(),
        'x-api-key': adminkey
      },
      method: 'POST',
      body: JSON.stringify({ name })
    })
    const json = await response.json()

    const data = WalletSchema.parse(json)

    return parse.fromLnbitsWalletToWallet(data)
  } catch (_error) {
    //
  }
}

async function updateWalletName(name: string, adminkey: string) {
  try {
    const response = await fetch(`${getCurrentBaseUrl()}/api/v1/wallet`, {
      headers: { ...headers, 'x-api-key': adminkey },
      method: 'PATCH',
      body: JSON.stringify({ name })
    })
    const json = await response.json()

    const data = WalletSchema.parse(json)

    return parse.fromLnbitsWalletToWallet(data)
  } catch (_error) {
    //
  }
}

async function deleteWallet(walletId: string, adminkey: string) {
  const response = await fetch(
    `${getCurrentBaseUrl()}/api/v1/wallet/${walletId}`,
    {
      headers: { ...headers, ...authHeaders(), 'x-api-key': adminkey },
      method: 'DELETE'
    }
  )

  if (!response.ok) throw new Error('Unable to delete wallet')
}

async function createInvoice(amount: number, inkey: string, memo?: string) {
  try {
    const response = await fetch(`${getCurrentBaseUrl()}/api/v1/payments`, {
      headers: { ...headers, 'x-api-key': inkey },
      method: 'POST',
      body: JSON.stringify({ out: false, unit: 'sat', amount, memo })
    })
    const json = await response.json()

    const data = InvoiceSchema.parse(json)

    return data
  } catch (_error) {
    //
  }
}

type PayBolt11 = {
  type: 'bolt11'
  invoice: string
}

type PayLnurl = {
  type: 'lnurl'
  /** LNURL-pay callback url */
  callback: string
  amount: number // in sats
  comment?: string
}

export type PayData = PayBolt11 | PayLnurl

async function pay(data: PayData, adminkey: string) {
  if (data.type === 'bolt11') {
    return payInvoice(data.invoice, adminkey)
  }

  if (data.type === 'lnurl') {
    return payLnurl(data, adminkey)
  }
}

// Pays bolt11 invoice
async function payInvoice(invoice: string, adminkey: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/api/v1/payments`, {
    headers: {
      ...headers,
      'x-api-key': adminkey
    },
    method: 'POST',
    body: JSON.stringify({ out: true, bolt11: invoice })
  })
  const json = await response.json()

  const { data, error } = PaymentSchema.safeParse(json)
  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  if (data.status === 'failed') throw new Error('Payment failed')

  return data
}

// Pays a LNURL-pay request (LUD-06/LUD-16): requests an invoice from the
// callback and pays it. Done client side so it works with any LNbits version.
async function payLnurl(payload: Omit<PayLnurl, 'type'>, adminkey: string) {
  const amountMsat = payload.amount * 1_000

  const url = new URL(payload.callback)
  url.searchParams.append('amount', String(amountMsat))
  if (payload.comment) url.searchParams.append('comment', payload.comment)

  const { data: response, error: fetchError } = await tryCatch(
    fetch(url.toString())
  )
  if (fetchError) throw new Error('Unable to reach the recipient')

  const { data: json } = await tryCatch(response.json())
  const { data } = LnurlPayCallbackSchema.safeParse(json)

  if (!data?.pr) throw new Error(data?.reason || 'Invalid recipient response')

  // Never pay an invoice for a different amount than requested
  let invoiceAmountMsat = NaN
  try {
    invoiceAmountMsat = Number(
      bolt11.decode(data.pr).human_readable_part.amount
    )
  } catch {
    //
  }
  if (invoiceAmountMsat !== amountMsat)
    throw new Error('Recipient returned an invalid invoice')

  return payInvoice(data.pr, adminkey)
}

// Swaps with Boltz
async function getBoltzConfig() {
  const response = await fetch(`${getCurrentBaseUrl()}/boltz/api/v1/swap/boltz`)

  const json = await response.json()

  const { data, error } = BoltzConfigurationSchema.safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data
}

async function listSwaps(adminkey: string) {
  const response = await fetch(
    `${getCurrentBaseUrl()}/boltz/api/v1/swap?all_wallets=true`,
    {
      headers: {
        'x-api-key': adminkey
      }
    }
  )
  const json = await response.json()

  const { data, error } = z.array(SwapSchema).safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data
}

async function listReverseSwaps(adminkey: string) {
  const response = await fetch(
    `${getCurrentBaseUrl()}/boltz/api/v1/swap/reverse?all_wallets=true`,
    {
      headers: {
        'x-api-key': adminkey
      }
    }
  )
  const json = await response.json()

  const { data, error } = z.array(SwapSchema).safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data
}

async function listAutoReverseSwaps(adminkey: string) {
  const response = await fetch(
    `${getCurrentBaseUrl()}/boltz/api/v1/swap/reverse/auto?all_wallets=true`,
    {
      headers: {
        'x-api-key': adminkey
      }
    }
  )
  const json = await response.json()

  const { data, error } = z.array(AutoSwapSchema).safeParse(json)

  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return data
}

export type CreateSwapData = {
  walletId: string
  address: string
  amount: number
  direction: 'in' | 'out'
  amountOption: 'send' | 'receive'
}

async function createSwap(data: CreateSwapData, adminkey: string) {
  const url = `${getCurrentBaseUrl()}/boltz/api/v1/swap${data.direction === 'out' ? '/reverse' : ''}`

  const body =
    data.direction === 'out'
      ? JSON.stringify({
          wallet: data.walletId,
          amount: data.amount,
          instant_settlement: true,
          onchain_address: data.address,
          feerate: false,
          direction: data.amountOption
        })
      : JSON.stringify({
          wallet: data.walletId,
          amount: data.amount,
          refund_address: data.address,
          feerate: false,
          direction: data.amountOption
        })

  const response = await fetch(url, {
    headers: {
      ...headers,
      'x-api-key': adminkey
    },
    method: 'POST',
    body
  })
  const json = await response.json()

  const { data: result, error } = SwapSchema.safeParse(json)
  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return result
}

export type CreateAutoSwapData = {
  walletId: string
  amount: number
  address: string
}

async function createAutoSwap(data: CreateAutoSwapData, adminkey: string) {
  const url = `${getCurrentBaseUrl()}/boltz/api/v1/swap/reverse/auto`

  const response = await fetch(url, {
    headers: {
      ...headers,
      'x-api-key': adminkey
    },
    method: 'POST',
    body: JSON.stringify({
      wallet: data.walletId,
      amount: data.amount,
      onchain_address: data.address,
      instant_settlement: true
    })
  })
  const json = await response.json()

  const { data: result, error } = AutoSwapSchema.safeParse(json)
  if (error) {
    const errorData = ValidationErrorSchema.parse(json)

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : errorData.detail[0].msg
    )
  }

  return result
}

async function deleteAutoSwap(id: string, adminkey: string) {
  const url = `${getCurrentBaseUrl()}/boltz/api/v1/swap/reverse/auto/${id}`

  const response = await fetch(url, {
    headers: {
      ...headers,
      'x-api-key': adminkey
    },
    method: 'DELETE'
  })

  if (response.ok) return true

  throw new Error()
}

export default {
  register,
  login,
  getUser,
  rate,
  getPaginatedPayments,
  getPaylinks,
  createPaylink,
  subscribePaymentWs,
  subscribeInkeyWs,
  createWallet,
  updateWalletName,
  deleteWallet,
  createInvoice,
  payInvoice,
  pay,
  payLnurl,
  getBoltzConfig,
  listSwaps,
  listReverseSwaps,
  listAutoReverseSwaps,
  createSwap,
  createAutoSwap,
  deleteAutoSwap
}
