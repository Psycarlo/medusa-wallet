import { memo, useMemo } from 'react'
import {
  type StyleProp,
  StyleSheet,
  TouchableHighlight,
  type ViewStyle
} from 'react-native'

import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'

import ChevronsUpDown from './icons/ChevronsUpDown'
import MText from './MText'

type MSelectButtonProps = {
  selected?: string
  placeholder?: string
  disabled?: boolean
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

function MSelectButton({
  selected,
  placeholder,
  disabled,
  style,
  ...props
}: MSelectButtonProps) {
  const selectButtonStyles = useMemo<StyleProp<ViewStyle>>(() => {
    return StyleSheet.compose({ ...styles.selectButtonBase }, style)
  }, [style])

  return (
    <TouchableHighlight
      underlayColor={Colors.grayDarkest}
      disabled={disabled}
      style={selectButtonStyles}
      {...props}
    >
      <MHStack style={{ justifyContent: 'space-between', height: '100%' }}>
        <MText color={selected ? 'white' : 'muted'}>
          {selected || placeholder || ''}
        </MText>
        {!disabled && <ChevronsUpDown />}
      </MHStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  selectButtonBase: {
    borderRadius: 8,
    height: 48,
    width: '100%',
    backgroundColor: Colors.grayDarker,
    fontSize: 14,
    paddingHorizontal: 16
  }
})

export default memo(MSelectButton)
