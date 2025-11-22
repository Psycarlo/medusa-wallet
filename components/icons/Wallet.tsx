import Svg, { Path } from 'react-native-svg'

import { Colors } from '@/styles'

export default function Wallet() {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      stroke={Colors.bitcoin}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Svg>
  )
}
