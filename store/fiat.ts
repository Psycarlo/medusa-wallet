import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import mmkvStorage from '@/storage/mmkv'
import type { FiatSnapshot } from '@/types/fiat'

type FiatState = {
  snapshots: Record<string, FiatSnapshot>
}

type FiatActions = {
  addSnapshot: (timestamp: string, snapshot: FiatSnapshot) => void
}

const useFiatStore = create<FiatState & FiatActions>()(
  persist(
    (set) => ({
      snapshots: {},
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
