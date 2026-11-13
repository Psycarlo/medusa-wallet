import {
  Attributes,
  Children,
  cloneElement,
  isValidElement,
  memo,
  useMemo,
  useState
} from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

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

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.default, center && styles.center, style]}
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
