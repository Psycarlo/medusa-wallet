import {
  Redirect,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import { useCallback } from 'react'
import Animated from 'react-native-reanimated'

import MNumPad from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import usePinEntry from '@/hooks/usePinEntry'
import useVerifyPin, { formatAttemptsRemaining } from '@/hooks/useVerifyPin'
import MMainLayout from '@/layouts/MMainLayout'
import MPinLayout from '@/layouts/MPinLayout'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import type { ValidatePinParams } from '@/types/searchParams'

export default function ValidatePin() {
  const router = useRouter()
  const { type } = useLocalSearchParams<ValidatePinParams>()
  const setPin = useAuthStore((state) => state.setPin)
  const updateAppLock = useSettingsStore((state) => state.updateAppLock)
  const { verifyPin, pinRetries } = useVerifyPin()

  const pinEntry = usePinEntry(async (pin) => {
    if (!type) return

    const result = await verifyPin(pin)
    if (result === 'lockedOut') return
    if (result === 'invalid') return false

    if (type === 'disable-pin') {
      await setPin('')
      updateAppLock('PIN_REMOVED')
      router.dismissTo('/settings')
    } else if (type === 'enable-biometric') {
      updateAppLock('BIOMETRIC_ENABLED')
      router.dismissTo('/settings')
    } else if (type === 'change-pin')
      router.push({ pathname: '/newPin', params: { backIcon: 'true' } })

    return true
  })

  const { reset } = pinEntry
  useFocusEffect(useCallback(() => reset(), [reset]))

  if (!type) return <Redirect href="/settings" />

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('enterYourPin')}
            </MText>
          )
        }}
      />
      <MPinLayout>
        <MText color="muted" center>
          {pinEntry.rejections > 0 ? formatAttemptsRemaining(pinRetries) : ''}
        </MText>
        <Animated.View style={pinEntry.shakeStyle}>
          <MPinInput filledCharacter={pinEntry.digitCount} />
        </Animated.View>
        <MNumPad type="pin" onKeyPress={pinEntry.handleKey} />
      </MPinLayout>
    </MMainLayout>
  )
}
