import { notificationAsync, NotificationFeedbackType } from 'expo-haptics'
import {
  Redirect,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import Animated from 'react-native-reanimated'
import { useShallow } from 'zustand/react/shallow'

import MNumPad, { type Keys } from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import { PIN_SIZE } from '@/config/auth'
import { useAnimatedShake } from '@/hooks/useAnimatedShake'
import useLogout from '@/hooks/useLogout'
import MMainLayout from '@/layouts/MMainLayout'
import MPinLayout from '@/layouts/MPinLayout'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import type { ValidatePinParams } from '@/types/searchParams'

export default function ValidatePin() {
  const router = useRouter()
  const { type } = useLocalSearchParams<ValidatePinParams>()
  const [
    pinRetries,
    setPin,
    validatePin,
    decrementPinRetries,
    resetPinRetries
  ] = useAuthStore(
    useShallow((state) => [
      state.pinRetries,
      state.setPin,
      state.validatePin,
      state.decrementPinRetries,
      state.resetPinRetries
    ])
  )
  const [setPinEnabled, setBiometricEnabled] = useSettingsStore(
    useShallow((state) => [state.setPinEnabled, state.setBiometricEnabled])
  )
  const logout = useLogout()
  const { shake, shakeStyle } = useAnimatedShake()

  const [localPin, setLocalPin] = useState('')
  const [failedOnce, setFailedOnce] = useState(false)

  function handleOnKeyPress(key: Keys) {
    if (key === 'DEL') setLocalPin((prev) => prev.slice(0, -1))
    else if (typeof key === 'number') setLocalPin((prev) => `${prev}${key}`)
  }

  useFocusEffect(
    useCallback(() => {
      setLocalPin('')
    }, [])
  )

  useEffect(() => {
    async function handleValidatePin() {
      if (!type) return
      if (localPin.length !== PIN_SIZE) return

      const isValid = await validatePin(localPin)

      if (!isValid) {
        if (pinRetries === 1) return await logout()
        setFailedOnce(true)
        decrementPinRetries()
        setLocalPin('')
        shake()
        await notificationAsync(NotificationFeedbackType.Error)
        return
      }

      setFailedOnce(false)
      resetPinRetries()

      if (type === 'disable-pin') {
        await setPin('')
        setPinEnabled(false)
        setBiometricEnabled(false)
        router.dismissTo('/settings')
      } else if (type === 'enable-biometric') {
        setBiometricEnabled(true)
        router.dismissTo('/settings')
      } else if (type === 'change-pin')
        router.push({ pathname: '/newPin', params: { backIcon: 'true' } })
    }

    handleValidatePin()
  }, [localPin]) // eslint-disable-line react-hooks/exhaustive-deps

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
          {failedOnce
            ? pinRetries === 1
              ? `1 ${t('attemptRemaining').toLowerCase()}`
              : `${pinRetries} ${t('attemptsRemaining').toLowerCase()}`
            : ''}
        </MText>
        <Animated.View style={shakeStyle}>
          <MPinInput filledCharacter={localPin.length} />
        </Animated.View>
        <MNumPad type="pin" onKeyPress={handleOnKeyPress} />
      </MPinLayout>
    </MMainLayout>
  )
}
