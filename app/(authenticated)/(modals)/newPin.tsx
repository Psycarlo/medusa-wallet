import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import Back from '@/components/icons/Back'
import MIconButton from '@/components/MIconButton'
import MNumPad, { type Keys } from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import { PIN_SIZE } from '@/config/auth'
import MMainLayout from '@/layouts/MMainLayout'
import MPinLayout from '@/layouts/MPinLayout'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import type { NewPinParams } from '@/types/searchParams'

export default function NewPin() {
  const router = useRouter()
  const setNewPin = useAuthStore((state) => state.setNewPin)
  const { backIcon } = useLocalSearchParams<NewPinParams>()

  const [pin, setPin] = useState('')

  function handleOnKeyPress(key: Keys) {
    if (key === 'DEL') setPin((prev) => prev.slice(0, -1))
    else if (typeof key === 'number') setPin((prev) => `${prev}${key}`)
  }

  useFocusEffect(
    useCallback(() => {
      setPin('')
      setNewPin('')
    }, [setNewPin])
  )

  useEffect(() => {
    setNewPin('')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pin.length !== PIN_SIZE) return
    setNewPin(pin)
    router.navigate('/confirmPin')
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => <MText>{t('enterNewPin')}</MText>,
          ...(backIcon
            ? {
                headerLeft: () => (
                  <MIconButton onPress={() => router.back()}>
                    <Back />
                  </MIconButton>
                )
              }
            : {})
        }}
      />
      <MPinLayout>
        <MText></MText>
        <MPinInput filledCharacter={pin.length} />
        <MNumPad type="pin" onKeyPress={handleOnKeyPress} />
      </MPinLayout>
    </MMainLayout>
  )
}
