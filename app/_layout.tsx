import 'react-native-reanimated'

import { useReactQueryDevTools } from '@dev-plugins/react-query'
import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import * as Network from 'expo-network'
import { Slot } from 'expo-router'
import * as SystemUI from 'expo-system-ui'
import { Platform, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Toaster } from 'sonner-native'

import useAppAuthentication from '@/hooks/useAppAuthentication'
import { Colors } from '@/styles'

NavigationBar.setBackgroundColorAsync(Colors.dark)

if (Platform.OS === 'android') {
  SystemUI.setBackgroundColorAsync(Colors.dark)
}

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

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
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
