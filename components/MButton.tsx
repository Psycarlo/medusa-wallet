import { memo, useMemo } from 'react'
import {
  type StyleProp,
  StyleSheet,
  TouchableHighlight,
  type ViewStyle
} from 'react-native'

import { Colors } from '@/styles'

import MActivityIndicator from './MActivityIndicator'
import MText from './MText'

type MButtonProps = {
  text: string
  variant?: 'default' | 'danger' | 'muted' | 'ghost'
  size?: 'default' | 'small'
  textSize?: 'default' | 'small'
  loading?: boolean
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

function MButton({
  text,
  variant = 'default',
  size = 'default',
  textSize = 'default',
  loading,
  disabled,
  style,
  ...props
}: MButtonProps) {
  const buttonStyles = useMemo<StyleProp<ViewStyle>>(() => {
    let buttonVariantStyles = {}
    if (variant === 'default') buttonVariantStyles = styles.defaultBase
    if (variant === 'muted') buttonVariantStyles = styles.mutedBase
    if (variant === 'ghost') buttonVariantStyles = styles.ghostBase

    let buttonSizeStyles =
      variant !== 'ghost'
        ? size === 'default'
          ? styles.sizeDefaultBase
          : styles.sizeSmallBase
        : {}

    return StyleSheet.compose(
      {
        ...styles.buttonBase,
        ...buttonVariantStyles,
        ...buttonSizeStyles,
        ...(disabled ? styles.disabled : {})
      },
      style
    )
  }, [variant, size, disabled, style])

  let underlayColor: string | undefined = Colors.bitcoinDark
  if (variant === 'muted') underlayColor = Colors.grayDarkest
  if (variant === 'danger') underlayColor = undefined
  if (variant === 'ghost') underlayColor = Colors.grayDarkest

  return (
    <TouchableHighlight
      underlayColor={underlayColor}
      style={buttonStyles}
      activeOpacity={loading ? 0 : 1}
      disabled={disabled}
      {...props}
    >
      <>
        <MText
          size={textSize === 'default' ? 'lg' : 'sm'}
          weight={variant !== 'ghost' ? 'semibold' : 'regular'}
          style={[
            loading && styles.hiddenText,
            variant === 'danger' && styles.textDanger,
            variant === 'ghost' && styles.textGhost
          ]}
        >
          {text}
        </MText>
        {loading && <MActivityIndicator style={styles.activityIndicatorBase} />}
      </>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  defaultBase: {
    backgroundColor: Colors.bitcoin
  },
  mutedBase: {
    backgroundColor: Colors.grayDarker
  },
  ghostBase: {
    backgroundColor: Colors.grayDarkest
  },
  sizeDefaultBase: {
    paddingHorizontal: 32,
    paddingVertical: 12
  },
  sizeSmallBase: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  textDanger: {
    color: Colors.danger
  },
  textGhost: {
    color: Colors.grayDark
  },
  disabled: {
    opacity: 0.4
  },
  hiddenText: {
    opacity: 0,
    visibility: 'hidden'
  },
  activityIndicatorBase: {
    position: 'absolute'
  }
})

export default memo(MButton)
