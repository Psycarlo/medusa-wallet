import { useMemo } from 'react'
import {
  type StyleProp,
  StyleSheet,
  TouchableHighlight,
  View,
  type ViewStyle
} from 'react-native'

import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'

import MText from './MText'

type Option = { label: string; value: string }

type MOptionSelectorProps = {
  options: [Option, Option]
  selected?: string
  setSelected: (selected: string) => void
}

export default function MOptionSelector({
  options,
  selected,
  setSelected
}: MOptionSelectorProps) {
  const optionStyle = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.optionBase
      },
      {}
    )
  }, [])

  return (
    <MHStack>
      {options.map((option) => (
        <TouchableHighlight
          key={option.value}
          style={[
            optionStyle,
            {
              borderWidth: selected === option.value ? 1 : 0,
              borderColor:
                selected === option.value ? Colors.bitcoin : undefined
            }
          ]}
          onPress={() => setSelected(option.value)}
        >
          <>
            <MText style={{ maxWidth: 120 }}>{option.label}</MText>
            {selected === option.value && <View style={styles.selected} />}
          </>
        </TouchableHighlight>
      ))}
    </MHStack>
  )
}

const styles = StyleSheet.create({
  optionBase: {
    flex: 1,
    width: '50%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.grayDarker,
    color: Colors.white,
    position: 'relative'
  },
  selected: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: Colors.bitcoin,
    position: 'absolute',
    top: 8,
    right: 8
  }
})
