import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { PIN_KEY, PIN_RETRIES } from '@/config/auth'
import { getItem, setItem } from '@/storage/encrypted'
import mmkvStorage from '@/storage/mmkv'

type AuthState = {
  firstTime: boolean
  loggedOut: boolean
  username: string
  email: string
  accessToken: string
  newPin: string
  pinRetries: number
  authTriggered: boolean
}

type AuthActions = {
  setFirstTime: (firstTime: AuthState['firstTime']) => void
  setLoggedOut: (loggedOut: AuthState['loggedOut']) => void
  setUsername: (username: AuthState['username']) => void
  setEmail: (email: AuthState['email']) => void
  setPin: (pin: string) => Promise<void>
  validatePin: (pin: string) => Promise<boolean>
  setAccessToken: (accessToken: AuthState['accessToken']) => void
  setNewPin: (newPin: AuthState['newPin']) => void
  decrementPinRetries: () => void
  resetPinRetries: () => void
  setAuthTriggered: (authTriggered: AuthState['authTriggered']) => void
  logout: () => void
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      firstTime: true,
      loggedOut: true,
      username: '',
      email: '',
      password: '',
      accessToken: '',
      newPin: '',
      pinRetries: PIN_RETRIES,
      authTriggered: false,
      setFirstTime: (firstTime) => {
        set({ firstTime })
      },
      setLoggedOut: (loggedOut) => {
        set({ loggedOut })
      },
      setUsername: (username) => {
        set({ username })
      },
      setEmail: (email) => {
        set({ email })
      },
      setPin: async (pin) => {
        await setItem(PIN_KEY, pin)
      },
      validatePin: async (pin) => {
        const savedPin = await getItem(PIN_KEY)
        return pin === savedPin
      },
      setAccessToken: (accessToken) => {
        set({ accessToken })
      },
      setNewPin: (newPin) => {
        set({ newPin })
      },
      decrementPinRetries: () => {
        set({ pinRetries: get().pinRetries - 1 })
      },
      resetPinRetries: () => {
        set({ pinRetries: PIN_RETRIES })
      },
      setAuthTriggered: (authTriggered) => {
        set({ authTriggered })
      },
      logout: () => {
        set({
          accessToken: '',
          loggedOut: true,
          username: ''
        })
      }
    }),
    {
      name: 'medusa-auth',
      storage: createJSONStorage(() => mmkvStorage)
    }
  )
)

export { useAuthStore }
