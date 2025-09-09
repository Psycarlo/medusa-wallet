import Svg, { Path, type SvgProps } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = Pick<SvgProps, 'width' | 'height' | 'stroke'>

export default function ChevronsUpDown({
  width = 16,
  height = 16,
  stroke = Colors.grayDark
}: IconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m7 15 5 5 5-5" />
      <Path d="m7 9 5-5 5 5" />
    </Svg>
  )
}
