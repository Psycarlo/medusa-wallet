import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import MText from '@/components/MText'

import MHStack from './MHStack'

type SSFormItemProps = {
  center?: boolean
  children: React.ReactNode
}

function FormItem({ center = false, children }: SSFormItemProps) {
  return (
    <View
      style={[styles.containerFormItem, center && { alignItems: 'center' }]}
    >
      {children}
    </View>
  )
}

type SSFormLabelProps = {
  label: string
  center?: boolean
}

function FormLabel({ label, center }: SSFormLabelProps) {
  return (
    <MText
      size="lg"
      weight="medium"
      style={{ textAlign: center ? 'center' : 'auto' }}
    >
      {label}
    </MText>
  )
}

type SSFromLayoutWithHintProps = {
  hint: string
  children: React.ReactNode
}

function FormWithHint({ hint, children }: SSFromLayoutWithHintProps) {
  return (
    <MHStack justifyBetween>
      {children}
      <MText color="muted" size="xs" style={{ textAlign: 'right' }}>
        {hint}
      </MText>
    </MHStack>
  )
}

type SSFormLayoutProps = {
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

function FormLayout({ children, style }: SSFormLayoutProps) {
  return <View style={[styles.containerForm, style]}>{children}</View>
}

const styles = StyleSheet.create({
  containerForm: {
    flexDirection: 'column',
    gap: 6,
    width: '100%',
    alignSelf: 'center'
  },
  containerFormItem: {
    flexDirection: 'column',
    gap: 6
  }
})

const SSFormLayout = Object.assign(FormLayout, {
  Item: FormItem,
  Label: FormLabel,
  WithHint: FormWithHint
})

export default SSFormLayout
