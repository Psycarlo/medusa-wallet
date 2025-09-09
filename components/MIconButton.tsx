import {
  Attributes,
  Children,
  cloneElement,
  isValidElement,
  memo,
  useMemo,
  useState
} from 'react'
import { type StyleProp, TouchableOpacity, type ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import { Colors } from '@/styles'

type MIconButtonProps = {
  center?: boolean
  noEnhanced?: boolean
} & React.ComponentPropsWithoutRef<typeof TouchableOpacity>

function MIconButton({
  center = true,
  noEnhanced = false,
  style,
  children,
  ...props
}: MIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const enhancedChildren = useMemo(() => {
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child, {
          stroke: isPressed ? `${Colors.grayLightest}` : Colors.white
        } as Attributes)
      }
      return child
    })
  }, [children, isPressed])

  const iconButtonStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.default,
        ...(center ? styles.center : {})
      },
      style
    )
  }, [center, style])

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={iconButtonStyles}
      {...props}
    >
      {noEnhanced ? children : enhancedChildren}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  default: {
    width: 32,
    height: 32
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default memo(MIconButton)
