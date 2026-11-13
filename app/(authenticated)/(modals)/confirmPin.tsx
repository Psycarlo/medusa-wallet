import { Stack, useRouter } from 'expo-router'
import Animated from 'react-native-reanimated'
import { useShallow } from 'zustand/react/shallow'

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
import { useSettingsStore } from '@/store/settings'

export default function ConfirmPin() {
  const router = useRouter()
  const [newPin, setPin, setNewPin] = useAuthStore(
    useShallow((state) => [state.newPin, state.setPin, state.setNewPin])
  )
  const updateAppLock = useSettingsStore((state) => state.updateAppLock)

  const pinEntry = usePinEntry(async (pin) => {
    if (pin !== newPin) return false

    await setPin(pin)
    setNewPin('')
    updateAppLock('PIN_SET')
    router.dismissTo('/settings')
    return true
  })

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('enterPinAgain')}
            </MText>
          ),
          headerLeft: () => (
            <MIconButton onPress={() => router.back()}>
              <Back />
            </MIconButton>
          )
        }}
      />
      <MPinLayout>
        {pinEntry.phase === 'rejected' ? (
          <MText color="muted" center>
            {t('pinsDoNotMatch')}
          </MText>
        ) : (
          <MText></MText>
        )}
        <Animated.View style={pinEntry.shakeStyle}>
          <MPinInput filledCharacter={pinEntry.digitCount} />
        </Animated.View>
        <MNumPad type="pin" onKeyPress={pinEntry.handleKey} />
      </MPinLayout>
    </MMainLayout>
  )
}
