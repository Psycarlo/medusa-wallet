import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { PIN_KEY, PIN_RETRIES } from '@/config/auth'
import {
  type LegacySessionFlags,
  migrateLegacySession,
  type SessionStatus,
  sessionTransition
} from '@/machines/session'
import { getItem, setItem } from '@/storage/encrypted'
import { mmkvStorage } from '@/storage/mmkv'

type AuthState = {
  /** See `machines/session.ts` for the allowed transitions */
  status: SessionStatus
  username: string
  email: string
  accessToken: string
  pinRetries: number
  /** PIN being created, waiting for its confirmation. Never persisted. */
  newPin: string
}

type PersistedAuthState = Omit<AuthState, 'newPin'>

type SignInData = {
  accessToken: AuthState['accessToken']
  username?: AuthState['username']
  email?: AuthState['email']
}

type AuthActions = {
  signIn: (data: SignInData) => void
  signOut: () => void
  lock: () => void
  unlock: () => void
  setUsername: (username: AuthState['username']) => void
  setEmail: (email: AuthState['email']) => void
  setPin: (pin: string) => Promise<void>
  validatePin: (pin: string) => Promise<boolean>
  setNewPin: (newPin: AuthState['newPin']) => void
  decrementPinRetries: () => void
  resetPinRetries: () => void
}

/** v0 stored the session as `firstTime`, `loggedOut` and `authTriggered` */
function migrateAuthState(
  persistedState: unknown,
  version: number
): PersistedAuthState {
  const state = (persistedState ?? {}) as Partial<PersistedAuthState> &
    LegacySessionFlags

  return {
    status: version < 1 ? migrateLegacySession(state) : state.status!,
    username: state.username ?? '',
    email: state.email ?? '',
    accessToken: state.accessToken ?? '',
    pinRetries: state.pinRetries ?? PIN_RETRIES
  }
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      status: 'onboarding',
      username: '',
      email: '',
      accessToken: '',
      pinRetries: PIN_RETRIES,
      newPin: '',
      signIn: ({ accessToken, username, email }) => {
        const status = sessionTransition(get().status, 'SIGN_IN')
        set({
          status,
          accessToken,
          ...(username !== undefined && { username }),
          ...(email !== undefined && { email })
        })
      },
      signOut: () => {
        set({
          status: sessionTransition(get().status, 'SIGN_OUT'),
          accessToken: '',
          username: '',
          email: '',
          pinRetries: PIN_RETRIES
        })
      },
      lock: () => {
        set({ status: sessionTransition(get().status, 'LOCK') })
      },
      unlock: () => {
        set({
          status: sessionTransition(get().status, 'UNLOCK'),
          pinRetries: PIN_RETRIES
        })
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
      setNewPin: (newPin) => {
        set({ newPin })
      },
      decrementPinRetries: () => {
        set({ pinRetries: get().pinRetries - 1 })
      },
      resetPinRetries: () => {
        set({ pinRetries: PIN_RETRIES })
      }
    }),
    {
      name: 'medusa-auth',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      migrate: migrateAuthState,
      partialize: ({ status, username, email, accessToken, pinRetries }) => ({
        status,
        username,
        email,
        accessToken,
        pinRetries
      })
    }
  )
)

export { migrateAuthState, useAuthStore }
