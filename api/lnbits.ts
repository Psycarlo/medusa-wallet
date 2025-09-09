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
  ConversionSchema,
  InkeyWebsocketSchema,
  InvoiceSchema,
  LnurlSchema,
  PaylinkSchema,
  PaymentSchema,
  RateSchema,
  UserSchema,
  ValidationErrorSchema,
  WalletSchema,
  WebsocketSchema
} from '@/schemas/lnbits'
import { useSettingsStore } from '@/store/settings'
import type { FiatSnapshot } from '@/types/fiat'
import type { Payment } from '@/types/lnbits'
import { getHistoricalPricesMap } from '@/utils/medusa'
import parse from '@/utils/parse'
import { generateRandomAddress } from '@/utils/random'
import { tryCatch } from '@/utils/tryCatch'

import medusa from './medusa'

export const BASE_URL = 'https://wallet.medusa.bz'

const headers = { 'Content-Type': 'application/json' }

function getCurrentBaseUrl() {
  return useSettingsStore.getState().lnbitsUrl
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

  return [...data.map((paylink) => parse.fromLnbitsPaylinkToPaylink(paylink))]
}

async function getUser(accessToken: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/api/v1/auth`, {
    headers: { ...headers, Cookie: `cookie_access_token=${accessToken}` },
    method: 'GET'
  })
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

async function convert(sats: number, fiat: SupportedFiatCurrencies) {
  try {
    const response = await fetch(`${getCurrentBaseUrl()}/api/v1/conversion`, {
      headers,
      method: 'POST',
      body: JSON.stringify({ from: 'sats', amount: sats, to: fiat })
    })
    const json = await response.json()

    const data = ConversionSchema.parse(json)

    return data[fiat]
  } catch (_error) {
    //
  }
}

async function rate(fiat: SupportedFiatCurrencies) {
  try {
    if (!fiat) throw new Error('Fiat not found')

    const response = await fetch(`${getCurrentBaseUrl()}/api/v1/rate/${fiat}`, {
      headers
    })
    const json = await response.json()

    const result = RateSchema.safeParse(json)

    if (result.error) throw new Error('Rate not loaded')

    return result.data.rate
  } catch (_error) {
    //
  }
}

async function getPayments(inkey: string) {
  const url = new URL(`${getCurrentBaseUrl()}/api/v1/payments`)
  url.searchParams.append('status', 'success')
  url.searchParams.append('direction', 'desc')

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
      timestamp: new Date(payment.time).getTime()
    }))
  )

  const fiatSnapshotForIds: Record<string, FiatSnapshot> = {}

  for (const [timestamp, ids] of Object.entries(historicalPricesMap)) {
    const ts = Number(timestamp)

    const fiatSnapshot = await medusa.getBitcoinPricesAt(ts)

    for (const id of ids) {
      fiatSnapshotForIds[id] = fiatSnapshot
    }
  }

  return data
    .map((payment) => parse.fromLnbitsPaymentToTransaction(payment))
    .map((transaction) => ({
      ...transaction,
      fiatSnapshot: Object.fromEntries(
        Object.entries(fiatSnapshotForIds[transaction.id]).map(
          ([fiat, btcPrice]) => [
            fiat,
            Number(
              ((transaction.sats / SATOSHIS_IN_BITCOIN) * btcPrice).toFixed(2)
            )
          ]
        )
      ) as FiatSnapshot
    }))
}

type GetPaginatedPaymentsOptions = {
  limit?: number
  offset?: number
  walletId?: string
}

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
      timestamp: new Date(payment.time).getTime()
    }))
  )

  const fiatSnapshotForIds: Record<string, FiatSnapshot> = {}

  for (const [timestamp, ids] of Object.entries(historicalPricesMap)) {
    let fiatSnapshot: FiatSnapshot

    if (snapshots[timestamp]) {
      fiatSnapshot = snapshots[timestamp]
    } else {
      const ts = Number(timestamp)
      fiatSnapshot = await medusa.getBitcoinPricesAt(ts)
    }

    for (const id of ids) {
      fiatSnapshotForIds[id] = fiatSnapshot
      addSnapshot(timestamp, fiatSnapshot)
    }
  }

  return data
    .map((payment) => parse.fromLnbitsPaymentToTransaction(payment))
    .map((transaction) => ({
      ...transaction,
      fiatSnapshot: Object.fromEntries(
        Object.entries(fiatSnapshotForIds[transaction.id]).map(
          ([fiat, btcPrice]) => [
            fiat,
            Number(
              ((transaction.sats / SATOSHIS_IN_BITCOIN) * btcPrice).toFixed(2)
            )
          ]
        )
      ) as FiatSnapshot
    }))
}

// TODO: getPaymentByHash

function subscribePaymentWs(
  paymentHash: Payment['payment_hash'],
  callback: () => void
) {
  const url = new URL(`${getCurrentBaseUrl()}/api/v1`)
  url.protocol = 'wss'
  url.pathname = `/api/v1/ws/${paymentHash}`

  const webSocket = new WebSocket(url.toString())
  webSocket.addEventListener('message', async ({ data }) => {
    const json = JSON.parse(data)

    const parsedData = WebsocketSchema.parse(json)

    if (!parsedData.pending || parsedData.paid) {
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
  webSocket.addEventListener('message', async ({ data }) => {
    const json = JSON.parse(data)

    const parsedData = InkeyWebsocketSchema.parse(json)

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
  try {
    await fetch(`${getCurrentBaseUrl()}/api/v1/wallet/${walletId}`, {
      headers: { ...headers, 'x-api-key': adminkey },
      method: 'DELETE'
    })
  } catch (_error) {
    //
  }
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
  callback: string
  amount: number // in sats
  comment?: string
  descriptionHash: string
  description: string
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

  return data
}

// Pays lnurl invoice
async function payLnurl(payload: Omit<PayLnurl, 'type'>, adminkey: string) {
  const response = await fetch(`${getCurrentBaseUrl()}/api/v1/payments/lnurl`, {
    headers: {
      ...headers,
      'x-api-key': adminkey
    },
    method: 'POST',
    body: JSON.stringify({
      description_hash: payload.descriptionHash,
      description: payload.description,
      callback: payload.callback,
      amount: payload.amount * 1_000, // in millisats
      unit: 'sat',
      ...(payload.comment ? { comment: payload.comment } : {})
    })
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

  return data
}

export default {
  register,
  login,
  getUser,
  convert,
  rate,
  getPayments,
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
  payLnurl
}
