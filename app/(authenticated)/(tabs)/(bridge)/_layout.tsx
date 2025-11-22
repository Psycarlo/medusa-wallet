import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs'
import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { Stack, useRouter, withLayoutContext } from 'expo-router'

import History from '@/components/icons/History'
import MIconButton from '@/components/MIconButton'
import MText from '@/components/MText'
import { t } from '@/locales'
import { Colors, Typography } from '@/styles'

const { Navigator } = createMaterialTopTabNavigator()

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator)

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
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: Colors.white,
          tabBarIndicatorStyle: { backgroundColor: Colors.bitcoin, height: 3 },
          tabBarStyle: { backgroundColor: Colors.dark }
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: t('normalSwaps'),
            tabBarLabelStyle: { fontFamily: Typography.sansSerifSemibold }
          }}
        />
        <MaterialTopTabs.Screen
          name="auto"
          options={{
            title: t('autoSwaps'),
            tabBarLabelStyle: { fontFamily: Typography.sansSerifSemibold }
          }}
        />
      </MaterialTopTabs>
    </>
  )
}
