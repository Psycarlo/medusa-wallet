import { memo } from 'react'
import { Switch } from 'react-native'

import { Colors } from '@/styles'

type MSwitchProps = React.ComponentPropsWithoutRef<typeof Switch>

function MSwitch({ value, ...props }: MSwitchProps) {
  return (
    <Switch
      value={value}
      trackColor={{ false: Colors.grayDarker, true: Colors.grayDark }}
      thumbColor={value ? Colors.white : Colors.grayDark}
      ios_backgroundColor={Colors.grayDarker}
      {...props}
    />
  )
}

export default memo(MSwitch)
