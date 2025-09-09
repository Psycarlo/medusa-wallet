import { notificationAsync, NotificationFeedbackType } from 'expo-haptics'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import Animated from 'react-native-reanimated'
import { useShallow } from 'zustand/react/shallow'

import Back from '@/components/icons/Back'
import MIconButton from '@/components/MIconButton'
import MNumPad, { type Keys } from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import { PIN_SIZE } from '@/config/auth'
import { useAnimatedShake } from '@/hooks/useAnimatedShake'
import MMainLayout from '@/layouts/MMainLayout'
import MPinLayout from '@/layouts/MPinLayout'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

export default function ConfirmPin() {
  const router = useRouter()
  const [newPin, setPin, setNewPin] = useAuthStore(
    useShallow((state) => [state.newPin, state.setPin, state.setNewPin])
  )
  const [setPinEnabled, setBiometricEnabled] = useSettingsStore(
    useShallow((state) => [state.setPinEnabled, state.setBiometricEnabled])
  )
  const { shake, shakeStyle } = useAnimatedShake()

  const [localPin, setLocalPin] = useState<string>('')
  const [invalidConfirmation, setInvalidConfirmation] = useState(false)

  function handleOnKeyPress(key: Keys) {
    if (key === 'DEL') setLocalPin((prev) => prev.slice(0, -1))
    else if (typeof key === 'number') setLocalPin((prev) => `${prev}${key}`)

    if (invalidConfirmation) setInvalidConfirmation(false)
  }

  useEffect(() => {
    async function handlePinValidation() {
      if (localPin.length !== PIN_SIZE) return

      if (localPin !== newPin) {
        setLocalPin('')
        shake()
        await notificationAsync(NotificationFeedbackType.Error)
        setInvalidConfirmation(true)
        return
      }

      setPin(localPin)
      setNewPin('')
      setPinEnabled(true)
      setBiometricEnabled(true)
      router.dismissTo('/settings')
    }

    handlePinValidation()
  }, [localPin]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => <MText>{t('enterPinAgain')}</MText>,
          headerLeft: () => (
            <MIconButton onPress={() => router.back()}>
              <Back />
            </MIconButton>
          )
        }}
      />
      <MPinLayout>
        {invalidConfirmation ? (
          <MText color="muted" center>
            {t('pinsDoNotMatch')}
          </MText>
        ) : (
          <MText></MText>
        )}
        <Animated.View style={shakeStyle}>
          <MPinInput filledCharacter={localPin.length} />
        </Animated.View>
        <MNumPad type="pin" onKeyPress={handleOnKeyPress} />
      </MPinLayout>
    </MMainLayout>
  )
}
