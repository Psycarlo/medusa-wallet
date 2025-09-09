import { type ForwardedRef, forwardRef, useMemo, useState } from 'react'
import {
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextStyle,
  TouchableOpacity,
  View
} from 'react-native'

import { Colors, Typography } from '@/styles'

import Eye from './icons/Eye'
import EyeOff from './icons/EyeOff'

type MTextInputProps = React.ComponentPropsWithoutRef<typeof TextInput>

function MTextInput(
  { style, secureTextEntry, maxLength, ...props }: MTextInputProps,
  ref: ForwardedRef<TextInput>
) {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry)

  const textInputStyle = useMemo<StyleProp<TextStyle>>(() => {
    return StyleSheet.compose(
      {
        ...styles.textInputBase
      },
      style
    )
  }, [style])

  return (
    <View style={styles.containerBase}>
      <TextInput
        ref={ref}
        secureTextEntry={isSecure}
        maxLength={maxLength}
        placeholderTextColor={Colors.grayDark}
        style={[textInputStyle, { paddingRight: secureTextEntry ? 38 : 16 }]}
        {...props}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.iconContainerBase}
          onPress={() => setIsSecure((prev) => !prev)}
        >
          {isSecure ? <Eye /> : <EyeOff />}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  containerBase: {
    position: 'relative'
  },
  textInputBase: {
    fontFamily: Typography.sansSerifRegular,
    borderRadius: 8,
    height: 48,
    width: '100%',
    backgroundColor: Colors.grayDarker,
    color: Colors.white,
    fontSize: 14,
    paddingLeft: 16
  },
  iconContainerBase: {
    width: 48,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default forwardRef(MTextInput)
