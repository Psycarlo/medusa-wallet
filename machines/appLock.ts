/**
 * App lock method state machine.
 *
 *   none ──PIN_SET──▶ pinAndBiometric ◀──BIOMETRIC_ENABLED── pin
 *                     pinAndBiometric ──BIOMETRIC_DISABLED─▶ pin
 *   pin | pinAndBiometric ──PIN_REMOVED──▶ none
 *
 * BIOMETRIC can't exist without a PIN (it is the fallback), so both live in a
 * single value. Creating a PIN also turns BIOMETRIC on: devices without it
 * simply fall back to the PIN. Changing the PIN (`PIN_SET` when one already
 * exists) keeps the current method.
 */
type AppLockMethod = 'none' | 'pin' | 'pinAndBiometric'

type AppLockEvent =
  'PIN_SET' | 'PIN_REMOVED' | 'BIOMETRIC_ENABLED' | 'BIOMETRIC_DISABLED'

const APP_LOCK_TRANSITIONS: Record<
  AppLockMethod,
  Partial<Record<AppLockEvent, AppLockMethod>>
> = {
  none: { PIN_SET: 'pinAndBiometric' },
  pin: { PIN_REMOVED: 'none', BIOMETRIC_ENABLED: 'pinAndBiometric' },
  pinAndBiometric: { PIN_REMOVED: 'none', BIOMETRIC_DISABLED: 'pin' }
}

/** Events that are not allowed for the current method are ignored */
function appLockTransition(
  method: AppLockMethod,
  event: AppLockEvent
): AppLockMethod {
  return APP_LOCK_TRANSITIONS[method][event] ?? method
}

function isPinEnabled(method: AppLockMethod) {
  return method !== 'none'
}

function isBiometricEnabled(method: AppLockMethod) {
  return method === 'pinAndBiometric'
}

/** Shape persisted before the method became a single value (version 0) */
type LegacyAppLockFlags = {
  pinEnabled?: boolean
  biometricEnabled?: boolean
}

function migrateLegacyAppLock(legacy: LegacyAppLockFlags): AppLockMethod {
  if (!legacy.pinEnabled) return 'none'
  return legacy.biometricEnabled ? 'pinAndBiometric' : 'pin'
}

export type { AppLockEvent, AppLockMethod, LegacyAppLockFlags }
export {
  APP_LOCK_TRANSITIONS,
  appLockTransition,
  isBiometricEnabled,
  isPinEnabled,
  migrateLegacyAppLock
}
