import * as LocalAuthentication from 'expo-local-authentication'
import { usePathname, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { AppState, type AppStateStatus } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import {
  ALLOWED_ENROLLED_LEVEL,
  GRACE_PERIOD_TIME,
  LOCK_TIME
} from '@/config/auth'
import {
  getLastBackgroundTimestamp,
  setLastBackgroundTimestamp
} from '@/storage/mmkv'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

/**
 *
 * Handles app authentication with PIN and BIOMETRIC.
 *
 * @description This hook handles the app authentication, i.e. if the app needs to be locked
 * and how the user will unlock it: using PIN or BIOMETRIC. Since BIOMETRIC can only be enabled
 * if PIN is enabled, the app only lock if PIN is enabled and the ellapsed time in the background
 * (inactive app time) is greater or equals than the LOCK_TIME constant. In addition, when user is
 * logged out no lock is triggered. When the app is inactive we display an overlay to improve privacy.
 * If lock is triggered and BIOMETRIC is enabled, BIOMETRIC wins over PIN. But to trigger BIOMETRIC the
 * device must have hardware, should be enrolled and the enrolled level should be greater or equal than
 * ALLOWED_ENROLLED_LEVEL constant. When trying to authenticate with BIOMETRIC the app navigates the user
 * to an empty screen. If user failed BIOMETRIC, it gets redirected to unlock with PIN page. When user
 * successfully authenticates he/she gets navigated to the main page (authenticated)/(tabs)/index.tsx.
 * If user fails PIN authentication more than PIN_RETRIES, he/she gets logged out.
 * There is a grace period when the user can leave the app and come back and return to the last visited page
 * if the page is 'camera', 'send' or 'receive'.
 * @todo allow user to click biometric again? when this happens? add this to the description above.
 * @todo If user restarts the app and failed faceid 2 times, prompt to enter iPhone passcode to regain access to biometrics
 * @todo If to faceid attemps failed, only allow Medusa PIN, even if user inactive->active app
 */
function useAppAuthentication() {
  const coldStart = useRef(true)
  const appState = useRef(AppState.currentState)
  const router = useRouter()
  const pathname = usePathname()
  const lastRoute = useRef<string | null>(null)

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

  useEffect(() => {
    if (!pathname.includes('privacy')) {
      lastRoute.current = pathname
    }
  }, [pathname])

  const handleAppStateChanged = useCallback(
    async (nextAppState: AppStateStatus) => {
      const requiresAuth = pinEnabled && !loggedOut

      if (requiresAuth && nextAppState === 'background') {
        setLastBackgroundTimestamp(Date.now())
      }

      if (
        nextAppState === 'inactive' ||
        (Platform.OS === 'android' && nextAppState === 'background')
      ) {
        router.replace('/(modals)/privacy') // Note: does not update app preview on android
      } else if (
        nextAppState === 'active' &&
        appState.current.match(/background|inactive/)
      ) {
        const elapsed = Date.now() - (getLastBackgroundTimestamp() || 0)

        // If back active within grace period go back to packge if camera, send or receive
        if (elapsed <= GRACE_PERIOD_TIME) {
          if (
            lastRoute.current &&
            ['camera', 'send', 'receive'].some((p) =>
              lastRoute.current?.includes(p)
            )
          ) {
            router.replace(lastRoute.current as any)
            return
          }
        }

        if (!requiresAuth) {
          router.replace('/')
        } else {
          if (elapsed >= LOCK_TIME || authTriggered) {
            setAuthTriggered(true)
            if (!biometricEnabled) router.navigate('/unlock')
            else {
              // Tries biometric first with black background (if enabled)
              const [hasHardware, isEnrolled, enrolledLevel] =
                await Promise.all([
                  LocalAuthentication.hasHardwareAsync(),
                  LocalAuthentication.isEnrolledAsync(),
                  LocalAuthentication.getEnrolledLevelAsync()
                ])
              if (
                !hasHardware ||
                !isEnrolled ||
                enrolledLevel < ALLOWED_ENROLLED_LEVEL
              )
                router.navigate('/unlock')
              else {
                router.replace('/(modals)/empty')

                const authenticateResult =
                  await LocalAuthentication.authenticateAsync({
                    disableDeviceFallback: true
                  })

                if (authenticateResult.success) {
                  setAuthTriggered(false)
                  router.replace('/')
                } else router.navigate('/unlock')
              }
            }
          } else {
            router.replace('/')
          }
        }
      }

      appState.current = nextAppState
    },
    [
      appState,
      router,
      pinEnabled,
      biometricEnabled,
      loggedOut,
      authTriggered,
      setAuthTriggered
    ]
  )

  useEffect(() => {
    if (coldStart.current) {
      handleAppStateChanged(AppState.currentState)
      coldStart.current = false
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChanged
    )

    return () => subscription.remove()
  }, [handleAppStateChanged])
}

export default useAppAuthentication
