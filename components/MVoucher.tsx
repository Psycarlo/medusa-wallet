import { memo, useMemo } from 'react'
import {
  type StyleProp,
  StyleSheet,
  TouchableHighlight,
  type ViewStyle
} from 'react-native'

import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { Colors } from '@/styles'

import MText from './MText'

type MVoucherProps = {
  amount: number
  fee: number
  selected: boolean
  onPress: () => void
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

function MVoucher({
  amount,
  fee,
  selected,
  onPress,
  style,
  ...props
}: MVoucherProps) {
  const buttonStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.buttonBase,
        ...(selected ? styles.buttonSelected : styles.buttonUnselected)
      },
      style
    )
  }, [selected, style])

  return (
    <TouchableHighlight
      underlayColor={Colors.bitcoinDark}
      style={buttonStyles}
      onPress={onPress}
      {...props}
    >
      <MVStack itemsCenter gap="none">
        <MText size="4xl" weight="bold">
          ${amount}
        </MText>
        <MText
          size="xxs"
          style={{ color: selected ? Colors.white : Colors.grayDark }}
        >
          {t('fee')}: {fee}%
        </MText>
      </MVStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonSelected: {
    backgroundColor: Colors.bitcoin
  },
  buttonUnselected: {
    backgroundColor: Colors.grayDarker
  }
})

export default memo(MVoucher)
