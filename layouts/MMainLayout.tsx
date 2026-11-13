import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { mainLayoutPaddingHorizontal } from '@/styles/layout'

const BOTTOM_PADDING = 32

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
  // Android is always edge-to-edge: keep content clear of the navigation bar
  const { bottom: bottomInset } = useSafeAreaInsets()

  const containerStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.containerBase,
        ...(withPaddingTop ? styles.withPaddingTop : {}),
        ...(withPaddingBottom
          ? { paddingBottom: BOTTOM_PADDING + bottomInset }
          : {})
      },
      [style]
    )
  }, [withPaddingTop, withPaddingBottom, bottomInset, style])

  return <View style={containerStyles}>{children}</View>
}

const styles = StyleSheet.create({
  containerBase: {
    flex: 1,
    paddingHorizontal: mainLayoutPaddingHorizontal
  },
  withPaddingTop: {
    paddingTop: 32
  }
})

export default memo(MMainLayout)
