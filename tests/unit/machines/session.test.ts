import { LOCK_TIME } from '@/config/auth'
import {
  isSignedIn,
  migrateLegacySession,
  type SessionEvent,
  type SessionStatus,
  sessionTransition,
  shouldLockAfterBackground
} from '@/machines/session'

describe('session machine', () => {
  describe('sessionTransition', () => {
    it('should sign in from onboarding and signed out', () => {
      expect(sessionTransition('onboarding', 'SIGN_IN')).toBe('signedIn')
      expect(sessionTransition('signedOut', 'SIGN_IN')).toBe('signedIn')
    })

    it('should lock and unlock a session', () => {
      expect(sessionTransition('signedIn', 'LOCK')).toBe('locked')
      expect(sessionTransition('locked', 'UNLOCK')).toBe('signedIn')
    })

    it('should sign out from a session, locked or not', () => {
      expect(sessionTransition('signedIn', 'SIGN_OUT')).toBe('signedOut')
      expect(sessionTransition('locked', 'SIGN_OUT')).toBe('signedOut')
    })

    it('should never go back to onboarding', () => {
      const statuses: SessionStatus[] = ['signedOut', 'signedIn', 'locked']
      const events: SessionEvent[] = ['SIGN_IN', 'SIGN_OUT', 'LOCK', 'UNLOCK']

      for (const status of statuses)
        for (const event of events)
          expect(sessionTransition(status, event)).not.toBe('onboarding')
    })

    it('should ignore events that are not allowed', () => {
      expect(sessionTransition('onboarding', 'SIGN_OUT')).toBe('onboarding')
      expect(sessionTransition('onboarding', 'LOCK')).toBe('onboarding')
      expect(sessionTransition('signedOut', 'LOCK')).toBe('signedOut')
      expect(sessionTransition('signedOut', 'UNLOCK')).toBe('signedOut')
      expect(sessionTransition('signedIn', 'UNLOCK')).toBe('signedIn')
      expect(sessionTransition('locked', 'LOCK')).toBe('locked')
      // A locked session can only be opened by unlocking it
      expect(sessionTransition('locked', 'SIGN_IN')).toBe('locked')
    })
  })

  describe('isSignedIn', () => {
    it('should be true while there is a session', () => {
      expect(isSignedIn('signedIn')).toBe(true)
      expect(isSignedIn('locked')).toBe(true)
      expect(isSignedIn('onboarding')).toBe(false)
      expect(isSignedIn('signedOut')).toBe(false)
    })
  })

  describe('shouldLockAfterBackground', () => {
    it('should lock after being away for the lock time', () => {
      expect(shouldLockAfterBackground('signedIn', LOCK_TIME - 1)).toBe(false)
      expect(shouldLockAfterBackground('signedIn', LOCK_TIME)).toBe(true)
    })

    it('should lock when the device clock moved back', () => {
      expect(shouldLockAfterBackground('signedIn', -1)).toBe(true)
    })

    it('should ask again when authentication was pending', () => {
      expect(shouldLockAfterBackground('locked', 0)).toBe(true)
    })

    it('should never lock without a session', () => {
      expect(shouldLockAfterBackground('onboarding', LOCK_TIME)).toBe(false)
      expect(shouldLockAfterBackground('signedOut', LOCK_TIME)).toBe(false)
    })
  })

  describe('migrateLegacySession', () => {
    it('should map the legacy flags to a status', () => {
      expect(migrateLegacySession({ firstTime: true, loggedOut: true })).toBe(
        'onboarding'
      )
      expect(migrateLegacySession({ firstTime: false, loggedOut: true })).toBe(
        'signedOut'
      )
      expect(
        migrateLegacySession({
          firstTime: false,
          loggedOut: false,
          accessToken: 'token'
        })
      ).toBe('signedIn')
      expect(
        migrateLegacySession({
          firstTime: false,
          loggedOut: false,
          accessToken: 'token',
          authTriggered: true
        })
      ).toBe('locked')
    })

    it('should not keep a session without an access token', () => {
      expect(
        migrateLegacySession({
          firstTime: false,
          loggedOut: false,
          accessToken: ''
        })
      ).toBe('signedOut')
    })

    it('should start onboarding when nothing was stored', () => {
      expect(migrateLegacySession({})).toBe('onboarding')
    })
  })
})
