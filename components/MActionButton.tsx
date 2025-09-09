import { StyleSheet, TouchableHighlight } from 'react-native'

import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'

import MText from './MText'

type MActionButtonProps = {
  text: string
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

export default function MActionButton({
  text,
  children,
  ...props
}: MActionButtonProps) {
  return (
    <TouchableHighlight
      underlayColor={Colors.grayDarkest}
      style={styles.buttonBase}
      {...props}
    >
      <MHStack style={{ gap: 6 }}>
        {children}
        <MText size="lg" weight="semibold">
          {text}
        </MText>
      </MHStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    backgroundColor: Colors.grayDarker,
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  }
})
