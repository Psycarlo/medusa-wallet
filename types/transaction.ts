import type { FiatSnapshot } from './fiat'

export type Transaction = {
  id: string
  type: 'in' | 'out'
  sats: number
  note?: string
  timestamp: number
  walletId: string
  bolt11: string
  fee: number
  fiatSnapshot?: FiatSnapshot
}
