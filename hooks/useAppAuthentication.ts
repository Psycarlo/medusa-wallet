import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { ALLOWED_ENROLLED_LEVEL, LOCK_TIME } from '@/config/auth'
import {
  getLastBackgroundTimestamp,
  setLastBackgroundTimestamp
} from '@/storage/mmkv'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

/**
 * Handles app authentication with PIN and BIOMETRIC.
 *
 * The app only locks when the PIN is enabled and the user is logged in:
 * - on every cold start;
 * - when it comes back from the background after LOCK_TIME or more.
 *
 * BIOMETRIC (when enabled and available) is tried first, falling back to the
 * PIN screen. While the app is not active a privacy overlay hides its content
 * (returned as `showPrivacyOverlay`) without changing the current screen, so
 * users go back to where they were when no lock is needed.
 *
 * The splash screen is hidden here once the first screen is decided so the
 * wallet is never visible before authenticating.
 */
function useAppAuthentication() {
  const router = useRouter()
  const coldStart = useRef(true)
  const appState = useRef<AppStateStatus>('active')
  const isAuthenticating = useRef(false)
  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false)

  const [pinEnabled, biometricEnabled] = useSettingsStore(
    useShallow((state) => [state.pinEnabled, state.biometricEnabled])
  )
  const [loggedOut, authTriggered, setAuthTriggered] = useAuthStore(
    useShallow((state) => [
      state.loggedOut,
      state.authTriggered,
      state.setAuthTriggered
    ])
  )

  const requiresAuth = pinEnabled && !loggedOut

  // `replace` keeps locked screens out of the history so the back button
  // can't return to them.
  const lockApp = useCallback(async () => {
    if (isAuthenticating.current) return
    isAuthenticating.current = true
    setAuthTriggered(true)

    try {
      if (!biometricEnabled) {
        router.replace('/unlock')
        return
      }

      // Hide the current screen while checking biometrics
      router.replace('/(modals)/empty')

      const [hasHardware, isEnrolled, enrolledLevel] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.getEnrolledLevelAsync()
      ])

      if (
        !hasHardware ||
        !isEnrolled ||
        enrolledLevel < ALLOWED_ENROLLED_LEVEL
      ) {
        router.replace('/unlock')
        return
      }

      const authenticateResult = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: true
      })

      if (authenticateResult.success) {
        setAuthTriggered(false)
        router.replace('/')
      } else router.replace('/unlock')
    } catch {
      router.replace('/unlock')
    } finally {
      isAuthenticating.current = false
    }
  }, [biometricEnabled, router, setAuthTriggered])

  const handleAppStateChanged = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousAppState = appState.current
      appState.current = nextAppState

      if (nextAppState !== 'active') {
        setShowPrivacyOverlay(true)
        if (nextAppState === 'background')
          setLastBackgroundTimestamp(Date.now())
        return
      }

      setShowPrivacyOverlay(false)

      // Ignore inactive -> active blips (biometric prompt, control center...)
      if (previousAppState !== 'background' || !requiresAuth) return
      if (isAuthenticating.current) return

      const elapsed = Date.now() - (getLastBackgroundTimestamp() || 0)
      if (elapsed >= LOCK_TIME || authTriggered) lockApp()
    },
    [requiresAuth, authTriggered, lockApp]
  )

  useEffect(() => {
    if (coldStart.current) {
      coldStart.current = false
      if (requiresAuth) {
        lockApp().finally(() =>
          requestAnimationFrame(() => SplashScreen.hide())
        )
      } else {
        SplashScreen.hide()
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChanged
    )

    return () => subscription.remove()
  }, [handleAppStateChanged]) // eslint-disable-line react-hooks/exhaustive-deps

  return { showPrivacyOverlay }
}

export default useAppAuthentication
