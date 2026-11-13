import 'react-native-reanimated'

import { useReactQueryDevTools } from '@dev-plugins/react-query'
import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import * as Network from 'expo-network'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { Toaster } from 'sonner-native'

import useAppAuthentication from '@/hooks/useAppAuthentication'
import { Colors } from '@/styles'

// Hidden by useAppAuthentication once the first screen is decided
SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({ duration: 300, fade: true })

const queryClient = new QueryClient()

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected)
  })
  return eventSubscription.remove
})

export default function RootLayout() {
  useReactQueryDevTools(queryClient)
  useAppAuthentication()

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.dark).catch(() => {})
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <KeyboardProvider>
          <StatusBar style="light" />
          <Slot />
          <Toaster
            theme="dark"
            position="bottom-center"
            style={{
              borderRadius: 8,
              backgroundColor: Colors.grayDarkest,
              borderWidth: 1,
              borderColor: Colors.grayDarker
            }}
            duration={10_000}
          />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark
  }
})
