import { StyleSheet, TouchableHighlight } from 'react-native'

import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { Colors } from '@/styles'

import PlusCircle from './icons/PlusCircle'
import MText from './MText'

type MNewWalletButtonProps = {
  onPress: () => void
}

export default function MNewWalletButton({ onPress }: MNewWalletButtonProps) {
  return (
    <TouchableHighlight style={styles.cardBase} onPress={onPress}>
      <MVStack itemsCenter style={{ flex: 1, justifyContent: 'center' }}>
        <MText>{t('newWallet')}</MText>
        <PlusCircle />
      </MVStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderColor: Colors.bitcoin,
    height: '100%',
    width: 240
  }
})
