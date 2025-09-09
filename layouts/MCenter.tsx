import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { Colors } from '@/styles'

type MCenterProps = {} & React.ComponentPropsWithoutRef<typeof View>

function MCenter({ children, style }: MCenterProps) {
  const centerStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose({ ...styles.centerBase }, style)
  }, [style])

  return <View style={centerStyles}>{children}</View>
}

const styles = StyleSheet.create({
  centerBase: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  }
})

export default memo(MCenter)
