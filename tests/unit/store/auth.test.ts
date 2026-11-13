import { PIN_RETRIES } from '@/config/auth'
import { migrateAuthState, useAuthStore } from '@/store/auth'

const mockStorage = new Map<string, string>()

jest.mock('@/storage/mmkv', () => ({
  mmkvStorage: {
    getItem: (name: string) => mockStorage.get(name) ?? null,
    setItem: (name: string, value: string) => {
      mockStorage.set(name, value)
    },
    removeItem: (name: string) => {
      mockStorage.delete(name)
    }
  }
}))

jest.mock('@/storage/encrypted', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}))

const initialState = useAuthStore.getState()

function getPersisted() {
  return JSON.parse(mockStorage.get('medusa-auth') ?? '{}') as {
    version: number
    state: Record<string, unknown>
  }
}

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState, true)
    mockStorage.clear()
  })

  describe('session', () => {
    it('should start onboarding', () => {
      expect(useAuthStore.getState().status).toBe('onboarding')
    })

    it('should sign in', () => {
      useAuthStore
        .getState()
        .signIn({ accessToken: 'token', username: 'satoshi', email: 'a@b.c' })

      expect(useAuthStore.getState()).toMatchObject({
        status: 'signedIn',
        accessToken: 'token',
        username: 'satoshi',
        email: 'a@b.c'
      })
    })

    it('should lock and unlock, giving the pin attempts back', () => {
      const { signIn, lock, unlock, decrementPinRetries } =
        useAuthStore.getState()

      signIn({ accessToken: 'token' })
      lock()
      expect(useAuthStore.getState().status).toBe('locked')

      decrementPinRetries()
      expect(useAuthStore.getState().pinRetries).toBe(PIN_RETRIES - 1)

      unlock()
      expect(useAuthStore.getState()).toMatchObject({
        status: 'signedIn',
        pinRetries: PIN_RETRIES
      })
    })

    it('should not lock without a session', () => {
      useAuthStore.getState().lock()
      expect(useAuthStore.getState().status).toBe('onboarding')
    })

    it('should remove the user data when signing out', () => {
      const { signIn, lock, decrementPinRetries, signOut } =
        useAuthStore.getState()

      signIn({ accessToken: 'token', username: 'satoshi', email: 'a@b.c' })
      lock()
      decrementPinRetries()
      signOut()

      expect(useAuthStore.getState()).toMatchObject({
        status: 'signedOut',
        accessToken: '',
        username: '',
        email: '',
        pinRetries: PIN_RETRIES
      })
    })
  })

  describe('persistence', () => {
    it('should never persist the pin being created', () => {
      useAuthStore.getState().setNewPin('1234')

      expect(useAuthStore.getState().newPin).toBe('1234')
      expect(getPersisted().state).not.toHaveProperty('newPin')
      expect(mockStorage.get('medusa-auth')).not.toContain('1234')
    })

    it('should persist the session', () => {
      useAuthStore.getState().signIn({ accessToken: 'token' })

      expect(getPersisted()).toMatchObject({
        version: 1,
        state: { status: 'signedIn', accessToken: 'token' }
      })
    })

    it('should restore a session stored by a previous version', async () => {
      mockStorage.set(
        'medusa-auth',
        JSON.stringify({
          version: 0,
          state: {
            firstTime: false,
            loggedOut: false,
            username: 'satoshi',
            email: 'a@b.c',
            password: '',
            accessToken: 'token',
            newPin: '1234',
            pinRetries: 3,
            authTriggered: true
          }
        })
      )

      await useAuthStore.persist.rehydrate()

      const state = useAuthStore.getState()
      expect(state).toMatchObject({
        status: 'locked',
        username: 'satoshi',
        email: 'a@b.c',
        accessToken: 'token',
        pinRetries: 3,
        newPin: ''
      })
      expect(state).not.toHaveProperty('firstTime')
      expect(state).not.toHaveProperty('loggedOut')
      expect(state).not.toHaveProperty('authTriggered')

      // The migrated state replaces the legacy one in storage
      expect(getPersisted()).toEqual({
        version: 1,
        state: {
          status: 'locked',
          username: 'satoshi',
          email: 'a@b.c',
          accessToken: 'token',
          pinRetries: 3
        }
      })
    })
  })

  describe('migrateAuthState', () => {
    it('should fall back to defaults for missing values', () => {
      expect(migrateAuthState(undefined, 0)).toEqual({
        status: 'onboarding',
        username: '',
        email: '',
        accessToken: '',
        pinRetries: PIN_RETRIES
      })
    })

    it('should send signed out users to sign in, not to the intro', () => {
      expect(
        migrateAuthState({ firstTime: false, loggedOut: true }, 0).status
      ).toBe('signedOut')
    })
  })
})
