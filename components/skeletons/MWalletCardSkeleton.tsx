import { StyleSheet, View } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'

import MText from '../MText'

export default function MWalletCardSkeleton() {
  return (
    <View style={styles.cardBase}>
      <MVStack style={styles.stackBase}>
        <MVStack gap="xs">
          <MText>{'\u00A0'}</MText>
          <MHStack
            gap="xs"
            style={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
          >
            <MText size="2xl" weight="bold">
              {'\u00A0'}
            </MText>
            <MText size="lg" weight="bold">
              {'\u00A0'}
            </MText>
          </MHStack>
          <MText>{'\u00A0'}</MText>
        </MVStack>
        <MVStack gap="none">
          <MText size="sm" weight="medium">
            {'\u00A0'}
          </MText>
          <MText size="sm">{'\u00A0'}</MText>
        </MVStack>
      </MVStack>
    </View>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 8,
    width: 200,
    backgroundColor: Colors.grayDarkest
  },
  stackBase: {
    padding: 12
  }
})
