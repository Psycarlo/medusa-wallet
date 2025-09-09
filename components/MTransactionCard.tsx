import { StyleSheet, TouchableHighlight } from 'react-native'

import type { SupportedFiatCurrencies } from '@/config/fiat'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useSettingsStore } from '@/store/settings'
import { Colors } from '@/styles'
import type { Transaction } from '@/types/transaction'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import number from '@/utils/number'

import Inbound from './icons/Inbound'
import Outbound from './icons/Outbound'
import MText from './MText'
import MTimeAgoText from './MTimeAgoText'

type MTransactionCardProps = {
  fiat: SupportedFiatCurrencies
  transaction: Transaction
  currentFiatPrice: number
  first?: boolean
  last?: boolean
} & React.ComponentPropsWithoutRef<typeof TouchableHighlight>

export default function MTransactionCard({
  fiat,
  transaction,
  currentFiatPrice,
  first = false,
  last = false,
  ...props
}: MTransactionCardProps) {
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  const displayLowValuePercentage = useSettingsStore(
    (state) => state.displayLowValuePercentage
  )

  return (
    <TouchableHighlight
      underlayColor={Colors.grayDarkest}
      style={[
        styles.cardBase,
        first && styles.cardFirst,
        last && styles.cardLast
      ]}
      {...props}
    >
      <MHStack gap="xs" style={[styles.stackBase, !last && styles.stackBorder]}>
        <MHStack style={{ flex: 1, flexBasis: '15%' }}>
          <MVStack itemsCenter style={styles.typeBase}>
            {transaction.type === 'in' ? <Inbound /> : <Outbound />}
          </MVStack>
          <MVStack gap="none" style={{ flex: 1, marginLeft: 2 }}>
            <MHStack gap="xs" style={{ justifyContent: 'flex-start' }}>
              <MText weight="medium">
                {transaction.type === 'in' ? '+' : '-'}
                {getFormattedBitcoinUnitAmount(transaction.sats)}
              </MText>
              <MText color="muted" size="sm" weight="medium">
                {getFormattedBitcoinUnitLabel()}
              </MText>
            </MHStack>
            {transaction.fiatSnapshot && (
              <MHStack style={{ justifyContent: 'flex-start' }}>
                <MText color="muted" size="sm" weight="medium">
                  {transaction.fiatSnapshot[fiat]} (
                  {formatNumber(currentFiatPrice, 2)}){' '}
                  {fiatUtils.getSymbol(fiat)}
                  {'  '}
                  {(() => {
                    const totalGain = Math.abs(
                      transaction.fiatSnapshot[fiat] - currentFiatPrice
                    )

                    if (!displayLowValuePercentage && totalGain < 0.01)
                      return ''

                    const percentageChange = number.getPercentageChange(
                      transaction.fiatSnapshot[fiat],
                      currentFiatPrice
                    )
                    return `${percentageChange > 0 ? '+' : ''}${percentageChange}%`
                  })()}
                </MText>
              </MHStack>
            )}
          </MVStack>
        </MHStack>
        <MVStack gap="none" style={{ alignItems: 'flex-end', flex: 1 }}>
          <MTimeAgoText
            timestamp={transaction.timestamp}
            textProps={{ color: 'muted' }}
          />
          <MText
            color={transaction.note ? 'white' : 'muted'}
            size="sm"
            weight="medium"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ textAlign: 'right' }}
          >
            {transaction.note ? transaction.note : t('noDescription')}
          </MText>
        </MVStack>
      </MHStack>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.grayDarkest
  },
  cardFirst: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8
  },
  cardLast: {
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8
  },
  stackBase: {
    height: 60,
    paddingHorizontal: 12
  },
  stackBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayDarker
  },
  typeBase: {
    width: 24,
    height: 24,
    backgroundColor: Colors.grayDarker,
    justifyContent: 'center',
    borderRadius: 4
  }
})
