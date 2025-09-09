import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, TouchableHighlight } from 'react-native'

import { WalletCardColor } from '@/config/colors'
import MHStack from '@/layouts/MHStack'

type MColorSelectorProps = {
  colors: WalletCardColor[]
  selected: WalletCardColor['id']
  onSelect: (id: WalletCardColor['id']) => void
}

function MColorSelector({ colors, selected, onSelect }: MColorSelectorProps) {
  return (
    <MHStack style={{ justifyContent: 'space-between' }}>
      {colors.map((entry) => (
        <TouchableHighlight key={entry.id} onPress={() => onSelect(entry.id)}>
          <LinearGradient
            colors={[entry.l, entry.r]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.colorBase,
              entry.id === selected && styles.colorSelected
            ]}
          />
        </TouchableHighlight>
      ))}
    </MHStack>
  )
}

const styles = StyleSheet.create({
  colorBase: {
    width: 38,
    height: 38,
    borderRadius: 8
  },
  colorSelected: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'white'
  }
})

export default MColorSelector
