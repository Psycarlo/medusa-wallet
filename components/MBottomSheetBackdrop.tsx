import {
  type BottomSheetBackdropProps,
  useBottomSheet
} from '@gorhom/bottom-sheet'
import { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { t } from '@/locales'
import { Colors } from '@/styles'

const BACKDROP_OPACITY = 0.5

/**
 * Replaces `BottomSheetBackdrop`: since react-native-gesture-handler v3 its
 * `GestureDetector` keeps catching touches while the sheet is closed,
 * blocking every screen that renders a sheet. This one uses a plain
 * `Pressable` and lets touches through whenever the sheet is closed.
 */
export default function MBottomSheetBackdrop({
  animatedIndex,
  style
}: BottomSheetBackdropProps) {
  const { close } = useBottomSheet()
  const [isOpen, setIsOpen] = useState(false)

  useAnimatedReaction(
    () => animatedIndex.value > -1,
    (open, previous) => {
      if (open !== previous) scheduleOnRN(setIsOpen, open)
    }
  )

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, BACKDROP_OPACITY],
      Extrapolation.CLAMP
    )
  }))

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[style, styles.backdrop, animatedStyle]}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel={t('close')}
        onPress={() => close()}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.black
  }
})
