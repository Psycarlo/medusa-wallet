import Svg, { Path } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = {
  active?: boolean
}

export default function Zap({ active = false }: IconProps) {
  return (
    <Svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke={active ? Colors.white : Colors.grayDark}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? Colors.white : Colors.grayDark}
    >
      <Path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </Svg>
  )
}
