import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { WalletCardColor } from '@/config/colors'
import mmkvStorage from '@/storage/mmkv'
import type { Unpacked } from '@/types/utils'
import type { Wallet } from '@/types/wallet'

type WalletsState = {
  walletColors: Record<Wallet['id'], WalletCardColor>
  selectedWalletId: Wallet['id'] | null
}

type WalletsActions = {
  clearStore: () => void
  updateWalletColor: (
    walletId: Unpacked<Wallet[]>['id'],
    color: WalletCardColor
  ) => void
  setSelectedWalletId: (
    selectedWalletId: WalletsState['selectedWalletId']
  ) => void
}

const initialState: WalletsState = {
  walletColors: {},
  selectedWalletId: null
}

const useWalletsStore = create<WalletsState & WalletsActions>()(
  persist(
    (set) => ({
      ...initialState,
      clearStore: () => {
        set({ ...initialState })
      },
      updateWalletColor: (walletId, color) => {
        set(
          produce((state: WalletsState) => {
            state.walletColors[walletId] = color
          })
        )
      },
      setSelectedWalletId: (selectedWalletId) => {
        set({ selectedWalletId })
      }
    }),
    {
      name: 'medusa-wallets',
      storage: createJSONStorage(() => mmkvStorage)
    }
  )
)

export { useWalletsStore }
