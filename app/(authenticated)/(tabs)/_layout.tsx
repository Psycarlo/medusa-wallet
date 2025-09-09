import { Redirect, Tabs, useRouter } from 'expo-router'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import CreditCard from '@/components/icons/CreditCard'
import Scan from '@/components/icons/Scan'
import Settings from '@/components/icons/Settings'
import Zap from '@/components/icons/Zap'
import MIconButton from '@/components/MIconButton'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { Colors } from '@/styles'
import { mainLayoutPaddingHorizontal } from '@/styles/layout'

export default function TabsLayout() {
  const router = useRouter()
  const [firstTime, loggedOut] = useAuthStore(
    useShallow((state) => [state.firstTime, state.loggedOut])
  )

  if (firstTime) return <Redirect href="/intro" />
  if (loggedOut) return <Redirect href="/signin" />

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          sceneStyle: {
            backgroundColor: Colors.dark
          },
          headerStyle: {
            backgroundColor: Colors.dark,
            elevation: 0,
            shadowOpacity: 0
          },
          headerLeftContainerStyle: {
            paddingLeft: mainLayoutPaddingHorizontal
          },
          headerRightContainerStyle: {
            paddingRight: mainLayoutPaddingHorizontal
          },
          headerTitle: () => null,
          headerLeft: () => (
            <MIconButton onPress={() => router.push('/camera')}>
              <Scan />
            </MIconButton>
          ),
          headerRight: () => (
            <MIconButton onPress={() => router.push('/settings')}>
              <Settings />
            </MIconButton>
          ),
          tabBarStyle: {
            backgroundColor: Colors.dark,
            borderTopWidth: 0
          },
          tabBarActiveTintColor: Colors.white,
          tabBarInactiveTintColor: Colors.grayDark
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('wallets'),
            tabBarIcon: ({ focused }) => <Zap active={focused} />
          }}
        />
        <Tabs.Screen
          name="buy"
          options={{
            title: t('buySats'),
            tabBarIcon: ({ focused }) => <CreditCard active={focused} />
          }}
        />
      </Tabs>
    </View>
  )
}
