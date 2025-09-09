import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { Gap, gaps } from '@/styles/layout'

type MVStackProps = {
  gap?: Gap
  itemsCenter?: boolean
  justifyBetween?: boolean
} & React.ComponentPropsWithoutRef<typeof View>

function MVStack({
  gap = 'sm',
  itemsCenter,
  justifyBetween,
  children,
  style
}: MVStackProps) {
  const stackStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.stackBase,
        ...{ gap: gaps[gap] },
        ...(itemsCenter ? styles.itemsCenter : {}),
        ...(justifyBetween ? styles.justifyBetween : {})
      },
      style
    )
  }, [gap, itemsCenter, justifyBetween, style])

  return <View style={stackStyles}>{children}</View>
}

const styles = StyleSheet.create({
  stackBase: {
    flexDirection: 'column',
    width: '100%'
  },
  itemsCenter: {
    alignItems: 'center'
  },
  justifyBetween: {
    flex: 1,
    justifyContent: 'space-between'
  }
})

export default memo(MVStack)
