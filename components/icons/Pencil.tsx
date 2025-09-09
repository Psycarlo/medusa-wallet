import Svg, { Path, SvgProps } from 'react-native-svg'

import { Colors } from '@/styles'

type IconProps = Pick<SvgProps, 'stroke'>

export default function Pencil({ stroke = Colors.grayDark }: IconProps) {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <Path d="m15 5 4 4" />
    </Svg>
  )
}
