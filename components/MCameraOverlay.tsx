import {
  Canvas,
  DiffRect,
  rect,
  RoundedRect,
  rrect
} from '@shopify/react-native-skia'
import { Platform, StyleSheet, useWindowDimensions } from 'react-native'

import { Colors } from '@/styles'

type SSCameraOverlayProps = {
  dimension?: number
  active?: boolean
}

export default function MCameraOverlay({
  dimension = 320,
  active
}: SSCameraOverlayProps) {
  const { width, height } = useWindowDimensions()

  const outer = rrect(rect(0, 0, width, height), 0, 0)
  const inner = rrect(
    rect(width / 2 - dimension / 2, 32, dimension, dimension),
    10,
    10
  )

  return (
    <Canvas
      style={
        Platform.OS === 'android' ? { flex: 1 } : StyleSheet.absoluteFillObject
      }
    >
      <DiffRect
        inner={inner}
        outer={outer}
        color={Colors.black}
        opacity={0.8}
      />
      <RoundedRect
        x={width / 2 - dimension / 2}
        y={32}
        height={dimension}
        width={dimension}
        r={10}
        color={active ? Colors.white : Colors.grayDarker}
        strokeWidth={2}
        style="stroke"
      />
    </Canvas>
  )
}
