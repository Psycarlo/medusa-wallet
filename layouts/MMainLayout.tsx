import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

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
  const containerStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.containerBase,
        ...(withPaddingTop ? styles.withPaddingTop : {}),
        ...(withPaddingBottom ? styles.withPaddingBottom : {})
      },
      [style]
    )
  }, [withPaddingTop, withPaddingBottom, style])

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
