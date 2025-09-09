import { ActivityIndicator, ViewStyle } from 'react-native'

import { Colors } from '@/styles'

type MActivityIndicatorProps = {
  style?: ViewStyle
}

export default function MActivityIndicator({ style }: MActivityIndicatorProps) {
  return <ActivityIndicator color={Colors.white} style={style} />
}
