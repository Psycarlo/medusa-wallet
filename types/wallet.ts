import type { Transaction } from './transaction'

export type Wallet = {
  id: string
  name: string
  adminkey: string
  inkey: string
  /** Wallet balance in satoshis */
  balance: number
  transactions: Transaction[]
  createdAt: number
  updatedAt: number | null | undefined
}
