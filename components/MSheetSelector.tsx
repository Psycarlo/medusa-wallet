import { memo } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'

import Check from './icons/Check'
import MText from './MText'

type Item = {
  id: string
  name: string
  info1: string
  info2?: string
}

type MSheetSelectorProps = {
  items: Item[]
  selectedId?: Item['id']
  withPaddingBottom?: boolean
  onSelect: (id: Item['id']) => void
}

function MSheetSelector({
  items,
  selectedId,
  withPaddingBottom = true,
  onSelect
}: MSheetSelectorProps) {
  return (
    <View style={{ paddingBottom: withPaddingBottom ? 40 : 0 }}>
      {items.map((item, index) => (
        <TouchableHighlight
          underlayColor={Colors.grayDarkest}
          style={[
            styles.entryBase,
            index === 0 && styles.entryFirst,
            index !== 0 && index !== items.length - 1 && styles.entryMiddle,
            index === items.length - 1 && styles.entryLast
          ]}
          key={item.id}
          onPress={() => onSelect(item.id)}
        >
          <MHStack justifyBetween>
            <MVStack gap="none" style={{ flex: 1 }}>
              <MText weight="medium">{item.name}</MText>
              <MHStack style={{ justifyContent: 'flex-start' }}>
                <MText size="sm" color="muted">
                  {item.info1}
                </MText>
                {item.info2 && (
                  <>
                    <View style={styles.circle} />
                    <MText size="sm" color="muted">
                      {item.info2}
                    </MText>
                  </>
                )}
              </MHStack>
            </MVStack>
            {selectedId === item.id && <Check />}
          </MHStack>
        </TouchableHighlight>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  entryBase: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.grayDarker,
    borderColor: Colors.grayDark,
    borderWidth: 1
  },
  entryFirst: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8
  },
  entryMiddle: {
    borderTopWidth: 0
  },
  entryLast: {
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8
  },
  circle: {
    width: 2,
    height: 2,
    backgroundColor: Colors.grayDark
  }
})

export default memo(MSheetSelector)
