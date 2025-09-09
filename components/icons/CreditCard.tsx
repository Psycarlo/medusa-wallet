import Svg, { Line, Rect, type SvgProps } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = {
  active?: boolean
} & Pick<SvgProps, 'width' | 'height'>

export default function CreditCard({
  width = 20,
  height = 20,
  active = false
}: IconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      stroke={active ? Colors.white : Colors.grayDark}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect width="20" height="14" x="2" y="5" rx="2" />
      <Line x1="2" x2="22" y1="10" y2="10" />
    </Svg>
  )
}
