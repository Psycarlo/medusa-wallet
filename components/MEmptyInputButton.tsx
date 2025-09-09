import { StyleSheet, TouchableHighlight } from 'react-native'

import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'

import MText from './MText'

type MEmptyInputButtonProps = {
  placeholder: string
  showPlaceholder: boolean
  children?: React.ReactNode
  iconRight?: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

function MEmptyInputButton({
  placeholder,
  showPlaceholder,
  children,
  iconRight,
  ...props
}: MEmptyInputButtonProps) {
  return (
    <TouchableHighlight style={styles.emptyInputButtonBase} {...props}>
      <MHStack justifyBetween>
        {showPlaceholder ? (
          <MText color="muted">{placeholder}</MText>
        ) : (
          children
        )}
        {!showPlaceholder && iconRight}
      </MHStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  emptyInputButtonBase: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 8,
    height: 48,
    width: '100%',
    backgroundColor: Colors.grayDarker,
    color: Colors.white,
    fontSize: 14,
    paddingHorizontal: 16
  }
})

export default MEmptyInputButton
