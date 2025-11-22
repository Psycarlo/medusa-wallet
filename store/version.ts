import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import mmkvStorage from '@/storage/mmkv'

type VersionState = {
  dismissedVersions: string[]
}

type VersionActions = {
  addDismissedVersion: (version: string) => void
}

const useVersionStore = create<VersionState & VersionActions>()(
  persist(
    (set) => ({
      dismissedVersions: [],
      addDismissedVersion: (version) => {
        set((state) => ({
          dismissedVersions: [...state.dismissedVersions, version]
        }))
      }
    }),
    { name: 'medusa-version', storage: createJSONStorage(() => mmkvStorage) }
  )
)

export { useVersionStore }
