import { Children, memo } from 'react'
import { StyleSheet, TouchableHighlight } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'

import MText from './MText'

type SettingsCardItemProps = {
  reverse?: boolean
  onPress?: () => void
  children: React.ReactNode
}

function SettingsCardItem({
  reverse = false,
  onPress,
  children
}: SettingsCardItemProps) {
  return (
    <TouchableHighlight onPress={onPress} style={styles.touchableBase}>
      <MHStack reverse={reverse}>{children}</MHStack>
    </TouchableHighlight>
  )
}

type SettingsCardLabelProps = {
  title: string
  value: string
  muted?: boolean
}

function SettingsCardLabel({ title, value, muted }: SettingsCardLabelProps) {
  return (
    <MVStack gap="xxs" style={{ flex: 1 }}>
      <MText color="muted" size="sm">
        {title}
      </MText>
      <MText weight="medium" color={muted ? 'muted' : 'white'}>
        {value}
      </MText>
    </MVStack>
  )
}

type SettingsCardProps = { title: string; children: React.ReactNode }

function SettingsCard({ title, children }: SettingsCardProps) {
  const arrayChildren = Children.toArray(children)

  return (
    <MVStack>
      <MText size="lg" weight="bold">
        {title}
      </MText>
      <MVStack gap="none">
        {arrayChildren.map((child, index) => (
          <MVStack
            key={index}
            itemsCenter
            style={[
              styles.containerBase,
              index === 0 && styles.cardFirst,
              index === arrayChildren.length - 1 && styles.cardLast,
              arrayChildren.length > 1 &&
                index !== 0 &&
                styles.cardPreviousBorder
            ]}
          >
            {child}
          </MVStack>
        ))}
      </MVStack>
    </MVStack>
  )
}

const styles = StyleSheet.create({
  touchableBase: {
    padding: 16
  },
  containerBase: {
    backgroundColor: Colors.grayDarkest,
    justifyContent: 'center'
  },
  cardFirst: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8
  },
  cardLast: {
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8
  },
  cardPreviousBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayDarker
  }
})

const MSettingsCard = Object.assign(memo(SettingsCard), {
  Item: SettingsCardItem,
  Label: SettingsCardLabel
})

export default MSettingsCard
