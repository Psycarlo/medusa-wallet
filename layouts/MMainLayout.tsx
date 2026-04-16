import { memo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { mainLayoutPaddingHorizontal } from '@/styles/layout'

type MMainLayoutProps = {
  withPaddingTop?: boolean
  withPaddingBottom?: boolean
} & Pick<React.ComponentPropsWithoutRef<typeof View>, 'style' | 'children'>

function MMainLayout({
  withPaddingTop = false,
  withPaddingBottom = false,
  style,
  children
}: MMainLayoutProps) {
  const insets = useSafeAreaInsets()

  const containerStyles: StyleProp<ViewStyle> = StyleSheet.compose(
    {
      ...styles.containerBase,
      ...(withPaddingTop ? styles.withPaddingTop : {}),
      ...(withPaddingBottom ? { paddingBottom: insets.bottom } : {})
    },
    [style]
  )

  return <View style={containerStyles}>{children}</View>
}

const styles = StyleSheet.create({
  containerBase: {
    flex: 1,
    paddingHorizontal: mainLayoutPaddingHorizontal
  },
  withPaddingTop: {
    paddingTop: 32
  },
  withPaddingBottom: {
    paddingBottom: 32
  }
})

export default memo(MMainLayout)
