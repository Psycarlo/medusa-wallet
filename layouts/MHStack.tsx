import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { Gap, gaps } from '@/styles/layout'

type MHStackProps = {
  gap?: Gap
  justifyBetween?: boolean
  reverse?: boolean
} & React.ComponentPropsWithoutRef<typeof View>

function MHStack({
  gap = 'sm',
  justifyBetween,
  reverse,
  children,
  style
}: MHStackProps) {
  const stackStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.stackBase,
        ...{ gap: gaps[gap] },
        ...(justifyBetween ? styles.justifyBetween : {}),
        ...(reverse ? styles.flexReverse : {})
      },
      style
    )
  }, [gap, justifyBetween, reverse, style])

  return <View style={stackStyles}>{children}</View>
}

const styles = StyleSheet.create({
  stackBase: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  justifyBetween: {
    justifyContent: 'space-between'
  },
  flexReverse: {
    flexDirection: 'row-reverse'
  }
})

export default memo(MHStack)
