import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import Animated from 'react-native-reanimated'

import type { Keys } from '@/components/MNumPad'
import MNumPad from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import usePinEntry from '@/hooks/usePinEntry'
import useVerifyPin, { formatAttemptsRemaining } from '@/hooks/useVerifyPin'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { isBiometricEnabled } from '@/machines/appLock'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

export default function Unlock() {
  const router = useRouter()
  const unlockSession = useAuthStore((state) => state.unlock)
  const biometricEnabled = useSettingsStore((state) =>
    isBiometricEnabled(state.appLock)
  )
  const { verifyPin, pinRetries } = useVerifyPin()

  function unlock() {
    unlockSession()
    router.replace('/')
  }

  const pinEntry = usePinEntry(async (pin) => {
    const result = await verifyPin(pin)
    if (result === 'lockedOut') return
    if (result === 'invalid') return false

    unlock()
    return true
  })

  // The app is locked: don't let the back button skip authentication
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    )
    return () => subscription.remove()
  }, [])

  function handleOnKeyPress(key: Keys) {
    if (key === 'BIOMETRIC') handleBiometric()
    else pinEntry.handleKey(key)
  }

  async function handleBiometric() {
    const { success } = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true
    })
    if (success) unlock()
  }

  return (
    <MMainLayout withPaddingTop withPaddingBottom>
      <MVStack
        style={{
          paddingHorizontal: 32,
          paddingVertical: 64,
          height: '100%',
          justifyContent: 'space-between'
        }}
      >
        <MVStack gap="xl">
          <MText weight="bold" size="4xl" center>
            {t('enterYourPin')}
          </MText>
          <MText color="muted" center>
            {pinEntry.rejections > 0 ? formatAttemptsRemaining(pinRetries) : ''}
          </MText>
          <Animated.View style={pinEntry.shakeStyle}>
            <MPinInput filledCharacter={pinEntry.digitCount} />
          </Animated.View>
        </MVStack>
        <MNumPad
          type={biometricEnabled ? 'auth' : 'pin'}
          onKeyPress={handleOnKeyPress}
        />
      </MVStack>
    </MMainLayout>
  )
}
