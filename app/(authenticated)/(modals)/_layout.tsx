import { Stack, useRouter } from 'expo-router'

import Close from '@/components/icons/Close'
import MIconButton from '@/components/MIconButton'
import { Colors } from '@/styles'

export default function ModalsLayout() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.dark
        },
        headerStyle: {
          backgroundColor: Colors.dark
        },
        headerTitle: () => <></>,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <MIconButton onPress={() => router.back()}>
            <Close />
          </MIconButton>
        ),
        presentation: 'modal'
      }}
    />
  )
}
