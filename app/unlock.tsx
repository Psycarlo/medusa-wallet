import { notificationAsync, NotificationFeedbackType } from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import Animated from 'react-native-reanimated'
import { useShallow } from 'zustand/react/shallow'

import type { Keys } from '@/components/MNumPad'
import MNumPad from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import { PIN_SIZE } from '@/config/auth'
import { useAnimatedShake } from '@/hooks/useAnimatedShake'
import useLogout from '@/hooks/useLogout'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

export default function Unlock() {
  const router = useRouter()
  const [
    pinRetries,
    validatePin,
    decrementPinRetries,
    resetPinRetries,
    setAuthTriggered
  ] = useAuthStore(
    useShallow((state) => [
      state.pinRetries,
      state.validatePin,
      state.decrementPinRetries,
      state.resetPinRetries,
      state.setAuthTriggered
    ])
  )
  const biometricEnabled = useSettingsStore((state) => state.biometricEnabled)
  const logout = useLogout()
  const { shake, shakeStyle } = useAnimatedShake()

  const [pin, setPin] = useState('')
  const [failedOnce, setFailedOnce] = useState(false)

  function handleOnKeyPress(key: Keys) {
    if (key === 'DEL') setPin((prev) => prev.slice(0, -1))
    else if (typeof key === 'number') setPin((prev) => `${prev}${key}`)
    else if (key === 'BIOMETRIC') console.log('todo: handle biometric')
  }

  useEffect(() => {
    async function handleValidatePin() {
      if (pin.length !== PIN_SIZE) return

      const isValid = await validatePin(pin)

      if (!isValid) {
        if (pinRetries === 1) return await logout()
        setFailedOnce(true)
        decrementPinRetries()
        setPin('')
        shake()
        await notificationAsync(NotificationFeedbackType.Error)
        return
      }

      setFailedOnce(false)
      resetPinRetries()
      setAuthTriggered(false)

      router.replace('/')
    }

    handleValidatePin()
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

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
            {failedOnce
              ? pinRetries === 1
                ? `1 ${t('attemptRemaining').toLowerCase()}`
                : `${pinRetries} ${t('attemptsRemaining').toLowerCase()}`
              : ''}
          </MText>
          <Animated.View style={shakeStyle}>
            <MPinInput filledCharacter={pin.length} />
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
