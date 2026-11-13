import { LOCK_TIME } from '@/config/auth'

/**
 * Session state machine.
 *
 *   onboarding ──SIGN_IN──▶ signedIn ◀──UNLOCK── locked
 *   signedOut  ──SIGN_IN──▶ signedIn ───LOCK───▶ locked
 *   signedIn | locked ──SIGN_OUT──▶ signedOut
 *
 * - `onboarding`: fresh install, nobody ever signed in (shows the intro).
 * - `signedOut`: someone signed in before but there is no session now.
 * - `signedIn`: valid session, app content is accessible.
 * - `locked`: valid session waiting for PIN or BIOMETRIC.
 */
type SessionStatus = 'onboarding' | 'signedOut' | 'signedIn' | 'locked'

type SessionEvent = 'SIGN_IN' | 'SIGN_OUT' | 'LOCK' | 'UNLOCK'

const SESSION_TRANSITIONS: Record<
  SessionStatus,
  Partial<Record<SessionEvent, SessionStatus>>
> = {
  onboarding: { SIGN_IN: 'signedIn' },
  signedOut: { SIGN_IN: 'signedIn' },
  signedIn: { LOCK: 'locked', SIGN_OUT: 'signedOut' },
  locked: { UNLOCK: 'signedIn', SIGN_OUT: 'signedOut' }
}

/** Events that are not allowed in the current status are ignored */
function sessionTransition(
  status: SessionStatus,
  event: SessionEvent
): SessionStatus {
  return SESSION_TRANSITIONS[status][event] ?? status
}

/** There is a session, locked or not */
function isSignedIn(status: SessionStatus) {
  return status === 'signedIn' || status === 'locked'
}

/**
 * Whether the app must ask for authentication when it comes back from the
 * background after `elapsed` milliseconds.
 */
function shouldLockAfterBackground(status: SessionStatus, elapsed: number) {
  // Authentication was still pending when the app left: ask again
  if (status === 'locked') return true
  if (status !== 'signedIn') return false
  // A negative elapsed time means the device clock was moved back
  return elapsed >= LOCK_TIME || elapsed < 0
}

/** Shape persisted before the session became a single status (version 0) */
type LegacySessionFlags = {
  firstTime?: boolean
  loggedOut?: boolean
  authTriggered?: boolean
  accessToken?: string
}

function migrateLegacySession(legacy: LegacySessionFlags): SessionStatus {
  if (legacy.firstTime ?? true) return 'onboarding'
  if ((legacy.loggedOut ?? true) || !legacy.accessToken) return 'signedOut'
  return legacy.authTriggered ? 'locked' : 'signedIn'
}

export type { LegacySessionFlags, SessionEvent, SessionStatus }
export {
  isSignedIn,
  migrateLegacySession,
  SESSION_TRANSITIONS,
  sessionTransition,
  shouldLockAfterBackground
}
