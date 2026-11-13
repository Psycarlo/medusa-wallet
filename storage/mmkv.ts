import { createMMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

const LAST_BACKGROUND_TIMESTAMP_KEY = 'lastBackgroundTimestamp'

const storage = createMMKV({ id: 'mmkv.medusa' })

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value)
  },
  getItem: (name) => {
    const value = storage.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    storage.remove(name)
  }
}

function setLastBackgroundTimestamp(timestamp: number) {
  storage.set(LAST_BACKGROUND_TIMESTAMP_KEY, timestamp)
}

function getLastBackgroundTimestamp() {
  return storage.getNumber(LAST_BACKGROUND_TIMESTAMP_KEY) ?? null
}

export { getLastBackgroundTimestamp, mmkvStorage, setLastBackgroundTimestamp }
