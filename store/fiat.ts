import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import mmkvStorage from '@/storage/mmkv'
import type { FiatSnapshot } from '@/types/fiat'

type FiatState = {
  rate: number
  snapshots: Record<string, FiatSnapshot>
}

type FiatActions = {
  setRate: (rate: FiatState['rate']) => void
  addSnapshot: (timestamp: string, snapshot: FiatSnapshot) => void
}

const useFiatStore = create<FiatState & FiatActions>()(
  persist(
    (set) => ({
      rate: 0,
      snapshots: {},
      setRate: (rate) => {
        set({ rate })
      },
      addSnapshot: (timestamp, snapshot) => {
        set(
          produce((state: FiatState) => {
            state.snapshots[timestamp] = snapshot
          })
        )
      }
    }),
    {
      name: 'medusa-fiat',
      storage: createJSONStorage(() => mmkvStorage)
    }
  )
)

export { useFiatStore }
