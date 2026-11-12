import { StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

import { Colors } from '@/styles'

type MCameraOverlayProps = {
  dimension?: number
  active?: boolean
}

const TOP_OFFSET = 32
const RADIUS = 10

export default function MCameraOverlay({
  dimension = 320,
  active
}: MCameraOverlayProps) {
  const { width, height } = useWindowDimensions()

  const x = width / 2 - dimension / 2
  const y = TOP_OFFSET
  const r = RADIUS

  // Full-screen rect with a rounded-rect hole (even-odd fill)
  const maskPath = [
    `M0 0H${width}V${height}H0Z`,
    `M${x + r} ${y}H${x + dimension - r}`,
    `A${r} ${r} 0 0 1 ${x + dimension} ${y + r}`,
    `V${y + dimension - r}`,
    `A${r} ${r} 0 0 1 ${x + dimension - r} ${y + dimension}`,
    `H${x + r}`,
    `A${r} ${r} 0 0 1 ${x} ${y + dimension - r}`,
    `V${y + r}`,
    `A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  ].join('')

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Path
        d={maskPath}
        fill={Colors.black}
        fillOpacity={0.8}
        fillRule="evenodd"
      />
      <Rect
        x={x}
        y={y}
        width={dimension}
        height={dimension}
        rx={r}
        ry={r}
        fill="none"
        stroke={active ? Colors.white : Colors.grayDarker}
        strokeWidth={2}
      />
    </Svg>
  )
}
