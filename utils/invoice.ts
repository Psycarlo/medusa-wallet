import lnaddress from '@/api/lnaddress'
import { type WellKnown } from '@/types/lnaddress'

import { bech32 } from './bech32'
import bolt11, { type Bolt11 } from './bolt11'

const LIGHTNING_SCHEME = 'lightning'
const BOLT11_SCHEME = 'lnbc'
const LNURL_SCHEME = 'lnurl'
export const LIGHTNING_ADDRESS_REGEX = /\S+@\S+\.\S+/

function isValidInvoice(invoice: string) {
  if (!invoice) return false

  const normalizedInvoice = invoice.trim().toLowerCase()
  let requestCode = normalizedInvoice

  if (LIGHTNING_ADDRESS_REGEX.test(invoice)) return true

  const hasLightningPrefix =
    normalizedInvoice.indexOf(`${LIGHTNING_SCHEME}:`) !== -1
  if (hasLightningPrefix)
    requestCode = normalizedInvoice.slice(10, normalizedInvoice.length)

  const hasLNURLPrefix = normalizedInvoice.indexOf(`${LNURL_SCHEME}:`) !== -1
  if (hasLNURLPrefix)
    requestCode = normalizedInvoice.slice(6, normalizedInvoice.length)

  const isLNURL = requestCode.startsWith(LNURL_SCHEME)
  if (isLNURL) {
    try {
      bech32.decode(requestCode, 1500)
      return true
    } catch {
      return false
    }
  }

  try {
    if (!requestCode.includes(BOLT11_SCHEME)) return false
    bolt11.decode(requestCode)
    return true
  } catch {
    return false
  }
}

type DecodeInvoiceReturn =
  | { type: 'wellknown'; data: WellKnown }
  | { type: 'bolt11'; data: Bolt11 }
  | false

async function decodeInvoice(invoice: string): Promise<DecodeInvoiceReturn> {
  if (!invoice) return false

  const normalizedInvoice = invoice.trim().toLowerCase()
  let requestCode = normalizedInvoice

  if (LIGHTNING_ADDRESS_REGEX.test(invoice)) {
    const result = await lnaddress.wellKnown(invoice)
    if (!result) return false
    return { type: 'wellknown', data: result }
  }

  const hasLightningPrefix =
    normalizedInvoice.indexOf(`${LIGHTNING_SCHEME}:`) !== -1
  if (hasLightningPrefix)
    requestCode = normalizedInvoice.slice(10, normalizedInvoice.length)

  const hasLNURLPrefix = normalizedInvoice.indexOf(`${LNURL_SCHEME}:`) !== -1
  if (hasLNURLPrefix)
    requestCode = normalizedInvoice.slice(6, normalizedInvoice.length)

  const isLNURL = requestCode.startsWith(LNURL_SCHEME)
  if (isLNURL) {
    try {
      const result = bech32.decode(requestCode, 1500)
      const url = String.fromCharCode(...bech32.fromWords(result.words))
      const data = await lnaddress.wellKnown(url, false)
      if (!data) return false
      return { type: 'wellknown', data }
    } catch {
      return false
    }
  }

  if (!requestCode.includes(BOLT11_SCHEME)) return false
  try {
    const data = bolt11.decode(requestCode)
    return { type: 'bolt11', data }
  } catch {
    return false
  }
}

function normalizeInvoice(invoice: string) {
  const index = invoice.indexOf(':')

  if (index === -1) return invoice.trim().toLowerCase()
  return invoice
    .substring(index + 1)
    .trim()
    .toLowerCase()
}

export { decodeInvoice, isValidInvoice, normalizeInvoice }
