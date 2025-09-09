import Svg, { Path } from 'react-native-svg'

import { Colors } from '@/styles'

export default function Receive() {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      stroke={Colors.white}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M12 17V3" />
      <Path d="m6 11 6 6 6-6" />
      <Path d="M19 21H5" />
    </Svg>
  )
}
