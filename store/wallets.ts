import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { WalletCardColor } from '@/config/colors'
import mmkvStorage from '@/storage/mmkv'
import type { Paylink } from '@/types/paylink'
import type { Unpacked } from '@/types/utils'
import type { Wallet } from '@/types/wallet'

type WalletsState = {
  wallets: Wallet[]
  walletColors: Record<Wallet['id'], WalletCardColor>
  selectedWalletId: Wallet['id'] | null
  totalBalance: number
  totalFiat: number
  paylink?: Paylink
}

type WalletsActions = {
  clearStore: () => void
  setWallets: (wallets: WalletsState['wallets']) => void
  addWallet: (wallet: Unpacked<WalletsState['wallets']>) => void
  updateWalletName: (wallet: Unpacked<WalletsState['wallets']>) => void
  updateWalletColor: (
    walletId: Unpacked<WalletsState['wallets']>['id'],
    color: WalletCardColor
  ) => void
  deleteWallet: (wallet: Unpacked<WalletsState['wallets']>) => void
  setSelectedWalletId: (
    selectedWalletId: WalletsState['selectedWalletId']
  ) => void
  setTotalBalance: (totalBalance: WalletsState['totalBalance']) => void
  setTotalFiat: (totalFiat: WalletsState['totalFiat']) => void
  setTransactions: (transactions: NonNullable<Wallet['transactions']>[]) => void
  setPaylink: (paylink: NonNullable<WalletsState['paylink']>) => void
}

const initialState: WalletsState = {
  wallets: [],
  walletColors: {},
  selectedWalletId: null,
  totalBalance: 0,
  totalFiat: 0,
  paylink: undefined
}

const useWalletsStore = create<WalletsState & WalletsActions>()(
  persist(
    (set) => ({
      ...initialState,
      clearStore: () => {
        set({ ...initialState })
      },
      setWallets: (wallets) => {
        set(
          produce((state: WalletsState) => {
            state.wallets = wallets.map((wallet) => {
              const existingWallet = state.wallets.find(
                (w) => w.id === wallet.id
              )

              return existingWallet?.transactions?.length
                ? { ...wallet, transactions: existingWallet.transactions }
                : wallet
            })
          })
        )
      },
      addWallet: (wallet) => {
        set(
          produce((state: WalletsState) => {
            state.wallets.push(wallet)
          })
        )
      },
      updateWalletName: (wallet) => {
        set(
          produce((state: WalletsState) => {
            const index = state.wallets.findIndex(
              (_wallet) => wallet.id === _wallet.id
            )
            if (index !== -1) state.wallets[index].name = wallet.name
          })
        )
      },
      updateWalletColor: (walletId, color) => {
        set(
          produce((state: WalletsState) => {
            state.walletColors[walletId] = color
          })
        )
      },
      deleteWallet: (wallet) => {
        set(
          produce((state: WalletsState) => {
            const index = state.wallets.findIndex(
              (_wallet) => wallet.id === _wallet.id
            )
            if (index !== -1) state.wallets.splice(index, 1)
          })
        )
      },
      setSelectedWalletId: (selectedWalletId) => {
        set({ selectedWalletId })
      },
      setTotalBalance: (totalBalance) => {
        set({ totalBalance, ...(totalBalance === 0 && { totalFiat: 0 }) })
      },
      setTotalFiat: (totalFiat) => {
        set({ totalFiat })
      },
      setTransactions: (transactions) => {
        set(
          produce((state: WalletsState) => {
            for (const transactionArray of transactions) {
              if (transactionArray.length === 0) continue
              const index = state.wallets.findIndex(
                (wallet) => wallet.id === transactionArray[0].walletId
              )
              if (index !== -1)
                state.wallets[index].transactions = transactionArray
            }
          })
        )
      },
      setPaylink: (paylink) => {
        set({ paylink })
      }
    }),
    {
      name: 'medusa-wallets',
      storage: createJSONStorage(() => mmkvStorage)
    }
  )
)

export { useWalletsStore }
