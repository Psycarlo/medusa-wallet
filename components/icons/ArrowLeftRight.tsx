import Svg, { Path, type SvgProps } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = Pick<SvgProps, 'width' | 'height' | 'stroke'>

export default function ArrowLeftRight({
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
      <Path d="m16 3 4 4-4 4" />
      <Path d="M20 7H4" />
      <Path d="m8 21-4-4 4-4" />
      <Path d="M4 17h16" />
    </Svg>
  )
}
