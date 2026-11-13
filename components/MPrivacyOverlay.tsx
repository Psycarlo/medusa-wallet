import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import { Colors } from '@/styles'

/** Hides the app content (e.g. in the app switcher) while it isn't active */
export default function MPrivacyOverlay() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require('@/assets/images/medusa-logo-large.png')}
        style={styles.logo}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 80,
    height: 80
  }
})
