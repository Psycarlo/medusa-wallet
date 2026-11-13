import { memo, useMemo, useRef, useState } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { mainLayoutPaddingHorizontal } from '@/styles/layout'

const BOTTOM_PADDING = 32

type MMainLayoutProps = {
  withPaddingTop?: boolean
  withPaddingBottom?: boolean
  /** Shrinks the content so inputs and buttons stay above the keyboard */
  avoidKeyboard?: boolean
} & Pick<React.ComponentPropsWithoutRef<typeof View>, 'style' | 'children'>

function MMainLayout({
  withPaddingTop = false,
  withPaddingBottom = false,
  avoidKeyboard = false,
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

  // Distance from the top of the window (e.g. a stack header above), which
  // KeyboardAvoidingView needs to compute the overlap with the keyboard
  const containerRef = useRef<React.ComponentRef<typeof View>>(null)
  const [windowOffset, setWindowOffset] = useState(0)

  function handleLayout() {
    if (!avoidKeyboard) return
    containerRef.current?.measureInWindow((_x: number, y: number) =>
      setWindowOffset(y)
    )
  }

  return (
    <View ref={containerRef} style={containerStyles} onLayout={handleLayout}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={windowOffset}
          style={styles.keyboardAvoiding}
        >
          {children}
        </KeyboardAvoidingView>
      ) : (
        children
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  containerBase: {
    flex: 1,
    paddingHorizontal: mainLayoutPaddingHorizontal
  },
  withPaddingTop: {
    paddingTop: 32
  },
  keyboardAvoiding: {
    flex: 1
  }
})

export default memo(MMainLayout)
