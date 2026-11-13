import { Stack, useRouter } from 'expo-router'
import { TopTabs } from 'expo-router/js-top-tabs'

import History from '@/components/icons/History'
import MIconButton from '@/components/MIconButton'
import MText from '@/components/MText'
import { t } from '@/locales'
import { Colors, Typography } from '@/styles'

export default function SwapsLayout() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <MIconButton onPress={() => router.navigate('/swaps')}>
              <History />
            </MIconButton>
          ),
          headerRight: undefined,
          headerTitle: () => (
            <MText
              size="lg"
              weight="bold"
            >{`${t('bridgeTitle1')} ${t('bridgeTitle2')}`}</MText>
          ),
          headerTitleAlign: 'center'
        }}
      />
      <TopTabs
        screenOptions={{
          tabBarActiveTintColor: Colors.white,
          tabBarIndicatorStyle: { backgroundColor: Colors.bitcoin, height: 3 },
          tabBarStyle: { backgroundColor: Colors.dark }
        }}
      >
        <TopTabs.Screen
          name="index"
          options={{
            title: t('normalSwaps'),
            tabBarLabelStyle: { fontFamily: Typography.sansSerifSemibold }
          }}
        />
        <TopTabs.Screen
          name="auto"
          options={{
            title: t('autoSwaps'),
            tabBarLabelStyle: { fontFamily: Typography.sansSerifSemibold }
          }}
        />
      </TopTabs>
    </>
  )
}
