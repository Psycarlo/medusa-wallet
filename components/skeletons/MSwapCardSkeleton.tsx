import { StyleSheet } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'

import MText from '../MText'

export default function MSwapCardSkeleton() {
  return (
    <MVStack style={styles.cardBase}>
      <MHStack
        justifyBetween
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <MHStack style={{ flex: 1, justifyContent: 'flex-start' }}>
          <MVStack itemsCenter style={styles.iconBase} />
          <MText>{'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</MText>
        </MHStack>
        <MHStack style={{ flex: 1, justifyContent: 'flex-end' }}>
          <MText>{'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</MText>
          <MVStack itemsCenter style={styles.iconBase} />
        </MHStack>
      </MHStack>
      <MVStack gap="none">
        {[1, 2, 3, 4].map((i) => (
          <MHStack
            key={i}
            justifyBetween
            style={{ paddingHorizontal: 16, paddingVertical: 4 }}
          >
            <MText color="muted">{'\u00A0\u00A0\u00A0\u00A0\u00A0'}</MText>
            <MText>{'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}</MText>
          </MHStack>
        ))}
      </MVStack>
    </MVStack>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    marginBottom: 10,
    backgroundColor: Colors.grayDarkest,
    borderRadius: 8,
    paddingBottom: 16
  },
  iconBase: {
    width: 24,
    height: 24,
    backgroundColor: Colors.grayDarker,
    justifyContent: 'center',
    borderRadius: 4
  }
})
