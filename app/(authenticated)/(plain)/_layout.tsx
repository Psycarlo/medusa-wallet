import { Stack, useRouter } from 'expo-router'

import Back from '@/components/icons/Back'
import MIconButton from '@/components/MIconButton'
import { Colors } from '@/styles'

export default function PlainLayout() {
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
            <Back />
          </MIconButton>
        ),
        headerBackVisible: false
      }}
    />
  )
}
