import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import { useCallback } from 'react'

import Back from '@/components/icons/Back'
import MIconButton from '@/components/MIconButton'
import MNumPad from '@/components/MNumPad'
import MPinInput from '@/components/MPinInput'
import MText from '@/components/MText'
import usePinEntry from '@/hooks/usePinEntry'
import MMainLayout from '@/layouts/MMainLayout'
import MPinLayout from '@/layouts/MPinLayout'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import type { NewPinParams } from '@/types/searchParams'

export default function NewPin() {
  const router = useRouter()
  const setNewPin = useAuthStore((state) => state.setNewPin)
  const { backIcon } = useLocalSearchParams<NewPinParams>()

  const pinEntry = usePinEntry((pin) => {
    setNewPin(pin)
    router.navigate('/confirmPin')
    return true
  })

  // Start over when coming back from the confirmation
  const { reset } = pinEntry
  useFocusEffect(
    useCallback(() => {
      reset()
      setNewPin('')
    }, [reset, setNewPin])
  )

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('enterNewPin')}
            </MText>
          ),
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
        <MPinInput filledCharacter={pinEntry.digitCount} />
        <MNumPad type="pin" onKeyPress={pinEntry.handleKey} />
      </MPinLayout>
    </MMainLayout>
  )
}
