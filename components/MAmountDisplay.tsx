import { View } from 'react-native'

import { SupportedFiatCurrencies } from '@/config/fiat'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'

import ArrowDownUp from './icons/ArrowDownUp'
import MIconButton from './MIconButton'
import MText from './MText'

export type MAmountDisplayType = 'btc' | 'fiat'

type MAmountDisplayProps = {
  type?: MAmountDisplayType
  sats: number
  fiat?: number
  fiatCurrency: SupportedFiatCurrencies
  rate: number
  withMax?: boolean
  onPressMax?: () => void
  onChangeType?: (type: MAmountDisplayType) => void
}

export default function MAmountDisplay({
  type = 'btc',
  sats,
  fiat,
  fiatCurrency,
  rate,
  withMax = false,
  onPressMax,
  onChangeType
}: MAmountDisplayProps) {
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  return (
    <MHStack style={{ flex: 1 }}>
      {withMax ? (
        <MIconButton onPress={onPressMax}>
          <MText color="muted">MAX</MText>
        </MIconButton>
      ) : (
        <View style={{ width: 32, height: 32 }} />
      )}
      {type === 'btc' ? (
        <MVStack gap="xs" itemsCenter style={{ flex: 1 }}>
          <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
            <MText size="2xl" weight="bold">
              {getFormattedBitcoinUnitAmount(sats)}
            </MText>
            <MText size="lg" color="muted" weight="bold">
              {getFormattedBitcoinUnitLabel()}
            </MText>
          </MHStack>
          <MText>
            {fiatUtils.getSymbol(fiatCurrency)}
            {formatNumber(fiat ? fiat : rate && sats / rate, 2)}
          </MText>
        </MVStack>
      ) : (
        <MVStack gap="xs" itemsCenter style={{ flex: 1 }}>
          <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
            <MText size="lg" color="muted" weight="bold">
              {fiatUtils.getSymbol(fiatCurrency)}
            </MText>
            <MText size="2xl" weight="bold">
              {formatNumber(fiat ? fiat : rate && sats / rate, 2)}
            </MText>
          </MHStack>
          <MText>
            {getFormattedBitcoinUnitAmount(sats)}{' '}
            {getFormattedBitcoinUnitLabel()}
          </MText>
        </MVStack>
      )}
      <MIconButton
        noEnhanced
        onPress={() => onChangeType?.(type === 'btc' ? 'fiat' : 'btc')}
      >
        <ArrowDownUp />
      </MIconButton>
    </MHStack>
  )
}
