import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, TouchableHighlight } from 'react-native'

import { WALLET_CARD_COLORS, type WalletCardColor } from '@/config/colors'
import type { SupportedFiatCurrencies } from '@/config/fiat'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import fiatUtils from '@/utils/fiat'

import MText from './MText'
import MTimeAgoText from './MTimeAgoText'

type MWalletCardProps = {
  name: string
  sats: number
  fiat: SupportedFiatCurrencies
  fiatAmount: string | number
  latestTransaction: number
  color: WalletCardColor | undefined
  onPress: () => void
}

export default function MWalletCard({
  name,
  sats,
  fiat,
  fiatAmount,
  latestTransaction,
  color,
  onPress
}: MWalletCardProps) {
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  return (
    <TouchableHighlight style={styles.cardBase} onPress={onPress}>
      <MVStack gap="md" style={styles.stackBase}>
        <LinearGradient
          colors={
            color
              ? [color.l, color.r]
              : [WALLET_CARD_COLORS[0].l, WALLET_CARD_COLORS[0].r]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.backgroundBase}
        />
        <MVStack gap="xs">
          <MText numberOfLines={1}>{name}</MText>
          <MHStack
            gap="xs"
            style={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
          >
            <MText size="2xl" weight="bold">
              {getFormattedBitcoinUnitAmount(sats)}
            </MText>
            <MText size="lg" weight="bold">
              {getFormattedBitcoinUnitLabel()}
            </MText>
          </MHStack>
          <MText>
            {fiatUtils.getSymbol(fiat)}
            {fiatAmount}
          </MText>
        </MVStack>
        <MVStack gap="none">
          <MText size="sm" weight="medium">
            {t('latestTransaction')}
          </MText>
          <MTimeAgoText timestamp={latestTransaction} />
        </MVStack>
        <Image
          source={require('@/assets/images/medusa-logo.png')}
          style={{
            width: 80,
            height: 80,
            position: 'absolute',
            bottom: 6,
            right: 3,
            tintColor: 'white',
            opacity: 0.2
          }}
        />
      </MVStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 8,
    overflow: 'hidden',
    width: 240
  },
  stackBase: {
    padding: 12
  },
  backgroundBase: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
})
