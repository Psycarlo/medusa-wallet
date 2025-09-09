import { memo, useMemo } from 'react'
import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native'

import { Colors, Sizes, Typography } from '@/styles'
import type { TextFontSize } from '@/styles/sizes'

export type MTextProps = {
  color?: 'white' | 'muted' | 'bitcoin' | 'danger'
  size?: TextFontSize
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  center?: boolean
} & React.ComponentPropsWithoutRef<typeof Text>

type WeightStyle = {
  fontFamily: TextStyle['fontFamily']
  fontWeight: TextStyle['fontWeight']
}

function MText({
  color = 'white',
  size = 'md',
  weight = 'regular',
  center,
  style,
  children,
  ...props
}: MTextProps) {
  const textStyles = useMemo<StyleProp<TextStyle>>(() => {
    let colorStyle = styles.colorWhite
    if (color === 'muted') colorStyle = styles.colorMuted
    if (color === 'bitcoin') colorStyle = styles.colorBitcoin
    if (color === 'danger') colorStyle = styles.colorDanger

    let weightStyle: WeightStyle = styles.textRegular
    if (weight === 'medium') weightStyle = styles.textMedium
    if (weight === 'semibold') weightStyle = styles.textSemibold
    if (weight === 'bold') weightStyle = styles.textBold

    return StyleSheet.compose(
      {
        ...styles.textBase,
        ...colorStyle,
        ...{ fontSize: Sizes.text.fontSize[size] },
        ...{ lineHeight: Sizes.text.fontSize[size] + 6 },
        ...weightStyle,
        ...(center ? styles.alignCenter : {})
      },
      style
    )
  }, [color, size, weight, center, style])

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  textBase: {
    fontSize: 14,
    color: Colors.white
  },
  colorWhite: {
    color: Colors.white
  },
  colorMuted: {
    color: Colors.grayDark
  },
  colorBitcoin: {
    color: Colors.bitcoin
  },
  colorDanger: {
    color: Colors.danger
  },
  alignCenter: {
    textAlign: 'center'
  },
  textRegular: {
    fontFamily: Typography.sansSerifRegular,
    fontWeight: '400'
  },
  textMedium: {
    fontFamily: Typography.sansSerifMedium,
    fontWeight: '500'
  },
  textSemibold: {
    fontFamily: Typography.sansSerifSemibold,
    fontWeight: '600'
  },
  textBold: {
    fontFamily: Typography.sansSerifBold,
    fontWeight: '600'
  }
})

export default memo(MText)
