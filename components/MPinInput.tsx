import { StyleSheet, View } from 'react-native'

import { PIN_SIZE } from '@/config/auth'
import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'

import Bitcoin from './icons/Bitcoin'
import Fishbone from './icons/Fishbone'
import Jellyfish from './icons/Jellyfish'
import Speedboat from './icons/Speedboat'

type MPinInputProps = {
  filledCharacter: null | number
}

export default function MPinInput({ filledCharacter }: MPinInputProps) {
  const icons = [<Jellyfish />, <Fishbone />, <Speedboat />, <Bitcoin />]

  return (
    <MHStack gap="sm">
      {[...Array(PIN_SIZE)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinInputBase,
            (filledCharacter || -1) > index
              ? styles.pinInputFilled
              : styles.pinInputBlank
          ]}
        >
          {(filledCharacter || -1) > index && icons[index]}
        </View>
      ))}
    </MHStack>
  )
}

const styles = StyleSheet.create({
  pinInputBase: {
    borderRadius: 8,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pinInputBlank: {
    backgroundColor: Colors.grayDarker
  },
  pinInputFilled: {
    backgroundColor: Colors.white
  }
})
