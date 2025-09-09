import Svg, { Path } from 'react-native-svg'

import { Colors } from '@/styles'

export default function Send() {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      stroke={Colors.white}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <Path d="m21.854 2.147-10.94 10.939" />
    </Svg>
  )
}
