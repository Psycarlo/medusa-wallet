import {
  type Paylink as LnbitsPaylink,
  type Payment,
  type Wallet as LnbitsWallet
} from '@/types/lnbits'
import { type Paylink } from '@/types/paylink'
import { type Unpacked } from '@/types/utils'
import { type Wallet } from '@/types/wallet'

function fromLnbitsWalletToWallet(lnbitsWallet: LnbitsWallet): Wallet {
  return {
    id: lnbitsWallet.id,
    name: lnbitsWallet.name,
    adminkey: lnbitsWallet.adminkey,
    inkey: lnbitsWallet.inkey,
    balance: lnbitsWallet.balance_msat / 1000,
    transactions: [],
    createdAt: new Date(lnbitsWallet.created_at).getTime(),
    updatedAt: new Date(lnbitsWallet.updated_at).getTime()
  }
}

function fromLnbitsPaymentToTransaction(
  lnbitsPayment: Payment
): Unpacked<NonNullable<Wallet['transactions']>> {
  return {
    id: lnbitsPayment.payment_hash,
    type: lnbitsPayment.amount > 0 ? 'in' : 'out',
    sats: Math.abs(lnbitsPayment.amount / 1000),
    note: lnbitsPayment.memo,
    timestamp: new Date(lnbitsPayment.time).getTime(),
    walletId: lnbitsPayment.wallet_id,
    bolt11: lnbitsPayment.bolt11,
    fee: lnbitsPayment.fee / 1000
  }
}

function fromLnbitsPaylinkToPaylink(paylink: LnbitsPaylink): Paylink {
  return {
    id: paylink.id,
    username: paylink.username,
    min: paylink.min,
    max: paylink.max,
    commentChars: paylink.comment_chars,
    lnurl: paylink.lnurl
  }
}

function getOldestWallet(wallets: Wallet[] | undefined) {
  if (!wallets || wallets.length === 0) return undefined

  return wallets.reduce((oldest, current) =>
    new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
  )
}

type LnAddress = {
  username: string
  domain: string
}

function lnaddress(lnaddress: string): LnAddress | false {
  const parts = lnaddress.split('@')

  if (parts.length !== 2) return false

  const [username, domain] = parts

  if (
    username.length === 0 ||
    domain.length === 0 ||
    !domain.includes('.') ||
    username.trim() === '' ||
    domain.trim() === ''
  )
    return false

  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!domainRegex.test(domain)) return false

  return { username, domain }
}

export default {
  fromLnbitsWalletToWallet,
  fromLnbitsPaymentToTransaction,
  fromLnbitsPaylinkToPaylink,
  getOldestWallet,
  lnaddress
}
