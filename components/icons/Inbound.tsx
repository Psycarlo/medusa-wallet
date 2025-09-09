import Svg, { Path, SvgProps } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = Pick<SvgProps, 'width' | 'height'>

export default function Inbound({ width = 16, height = 16 }: IconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      stroke={Colors.green}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      rotation={90}
    >
      <Path d="M7 7h10v10" />
      <Path d="M7 17 17 7" />
    </Svg>
  )
}
