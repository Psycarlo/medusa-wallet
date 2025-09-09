import Svg, { Circle, Path } from 'react-native-svg'

import { Colors } from '@/styles'

export default function PlusCircle() {
  return (
    <Svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke={Colors.bitcoin}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 12h8" />
      <Path d="M12 8v8" />
    </Svg>
  )
}
