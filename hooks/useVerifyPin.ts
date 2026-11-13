import { useCallback } from 'react'

import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'

import useLogout from './useLogout'

type VerifyPinResult = 'valid' | 'invalid' | 'lockedOut'

/** e.g. "2 attempts remaining" */
function formatAttemptsRemaining(pinRetries: number) {
  const label =
    pinRetries === 1 ? t('attemptRemaining') : t('attemptsRemaining')
  return `${pinRetries} ${label.toLowerCase()}`
}

/**
 * Checks a PIN against the saved one while counting the remaining attempts.
 * Running out of attempts logs the user out (`lockedOut`).
 */
function useVerifyPin() {
  const logout = useLogout()
  const pinRetries = useAuthStore((state) => state.pinRetries)

  const verifyPin = useCallback(
    async (pin: string): Promise<VerifyPinResult> => {
      const { validatePin, decrementPinRetries, resetPinRetries } =
        useAuthStore.getState()

      if (await validatePin(pin)) {
        resetPinRetries()
        return 'valid'
      }

      // Read the current value: it may have changed while validating
      if (useAuthStore.getState().pinRetries <= 1) {
        await logout()
        return 'lockedOut'
      }

      decrementPinRetries()
      return 'invalid'
    },
    [logout]
  )

  return { verifyPin, pinRetries }
}

export { formatAttemptsRemaining }
export default useVerifyPin
