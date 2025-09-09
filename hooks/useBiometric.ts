import * as LocalAuthentication from 'expo-local-authentication'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import { ALLOWED_ENROLLED_LEVEL } from '@/config/auth'

/**
 *
 * Returns a function to authenticate with BIOMETRIC and state to know
 * if device has required enroll level
 */
function useBiometric() {
  const [hasBiometric, setHasBiometric] = useState(false)

  useFocusEffect(
    useCallback(() => {
      async function getBiometricDeviceInfo() {
        const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync()

        setHasBiometric(enrolledLevel >= ALLOWED_ENROLLED_LEVEL)
      }

      getBiometricDeviceInfo()
    }, [])
  )

  async function biometricAuth() {
    const authenticateResult = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true
    })

    return authenticateResult.success
  }

  return { hasBiometric, biometricAuth }
}

export default useBiometric
