import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { StyleSheet } from 'react-native'

import MHStack from '@/layouts/MHStack'
import { Colors } from '@/styles'
import { formatAddress } from '@/utils/format'

import Check from './icons/Check'
import Copy from './icons/Copy'
import MIconButton from './MIconButton'
import MText from './MText'

type MAddressCopyProps = {
  address: string
  noFormat?: boolean
  placeholder?: string
}

export default function MAddressCopy({
  address,
  noFormat = false,
  placeholder
}: MAddressCopyProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    if (!address) return
    await Clipboard.setStringAsync(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <MHStack justifyBetween style={styles.viewBase}>
      <MText
        style={{ flex: 1 }}
        numberOfLines={1}
        color={address ? 'white' : 'muted'}
      >
        {address ? (noFormat ? address : formatAddress(address)) : placeholder}
      </MText>
      <MIconButton onPress={handleClick}>
        {copied ? <Check stroke={Colors.white} /> : address ? <Copy /> : null}
      </MIconButton>
    </MHStack>
  )
}

const styles = StyleSheet.create({
  viewBase: {
    backgroundColor: Colors.grayDarker,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8
  }
})
