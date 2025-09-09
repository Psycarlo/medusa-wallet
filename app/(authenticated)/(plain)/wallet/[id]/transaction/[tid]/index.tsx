import { Redirect, useLocalSearchParams } from 'expo-router'

import Inbound from '@/components/icons/Inbound'
import Outbound from '@/components/icons/Outbound'
import MText from '@/components/MText'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import type { TransactionSearchParams } from '@/types/searchParams'
import fiat from '@/utils/fiat'
import { formatAddress, formatDateTime, formatNumber } from '@/utils/format'

export default function Transaction() {
  const { id, tid } = useLocalSearchParams<TransactionSearchParams>()

  const wallet = useWalletsStore((state) =>
    state.wallets.find((wallet) => wallet.id === id)
  )
  const transaction = wallet?.transactions.find(
    (transaction) => transaction.id === tid
  )
  const rate = useFiatStore((state) => state.rate)
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  if (!id || !tid || !wallet || !transaction) return <Redirect href="/" />

  return (
    <MMainLayout withPaddingTop withPaddingBottom>
      <MVStack itemsCenter gap="xl">
        <MVStack itemsCenter gap="md">
          <MVStack
            itemsCenter
            style={{
              width: 32,
              height: 32,
              backgroundColor: Colors.grayDarker,
              justifyContent: 'center',
              borderRadius: 6
            }}
          >
            {transaction.type === 'in' ? (
              <Inbound width={20} height={20} />
            ) : (
              <Outbound width={20} height={20} />
            )}
          </MVStack>
          <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
            <MText size="2xl" weight="bold">
              {transaction.type === 'in' ? '+' : '-'}
              {getFormattedBitcoinUnitAmount(transaction.sats)}
            </MText>
            <MText color="muted" size="lg" weight="bold">
              {getFormattedBitcoinUnitLabel()}
            </MText>
          </MHStack>
          <MHStack>
            <MVStack itemsCenter style={{ flex: 1, width: '50%' }}>
              <MText color="muted">{t('snapshotAmount')}</MText>
              <MText size="lg" weight="medium">
                {fiat.getSymbol(fiatCurrency)}
                {formatNumber(
                  (rate &&
                    transaction.fiatSnapshot &&
                    transaction.fiatSnapshot[fiatCurrency]) ||
                    0 / rate,
                  2
                )}
              </MText>
            </MVStack>
            <MVStack itemsCenter style={{ flex: 1, width: '50%' }}>
              <MText color="muted">{t('todaysPrice')}</MText>
              <MText size="lg" weight="medium">
                {fiat.getSymbol(fiatCurrency)}
                {formatNumber(rate && transaction.sats / rate, 2)}
              </MText>
            </MVStack>
          </MHStack>
        </MVStack>
        <MVStack gap="md">
          <MVStack
            style={{
              backgroundColor: Colors.grayDarkest,
              borderRadius: 8,
              padding: 16
            }}
          >
            <MHStack justifyBetween>
              <MText color="muted">{t('wallet')}</MText>
              <MText weight="medium">{wallet.name}</MText>
            </MHStack>
          </MVStack>
          <MVStack
            style={{
              backgroundColor: Colors.grayDarkest,
              borderRadius: 8
            }}
          >
            <MHStack justifyBetween style={{ padding: 16 }}>
              <MText color="muted">{t('hash')}</MText>
              <MText weight="medium">{formatAddress(transaction.id)}</MText>
            </MHStack>
            <MHStack justifyBetween style={{ padding: 16 }}>
              <MText color="muted">{t('bolt11')}</MText>
              <MText weight="medium">{formatAddress(transaction.bolt11)}</MText>
            </MHStack>
            <MHStack justifyBetween style={{ padding: 16 }}>
              <MText color="muted">{t('fee')}</MText>
              <MHStack gap="xs" style={{ width: 'auto' }}>
                <MText weight="medium">
                  {formatNumber(-transaction.fee, 0, true)}
                </MText>
                <MText color="muted">sats</MText>
              </MHStack>
            </MHStack>
            <MHStack justifyBetween style={{ padding: 16 }}>
              <MText color="muted">{t('note')}</MText>
              <MText
                weight="medium"
                color={transaction.note ? 'white' : 'muted'}
              >
                {transaction.note || t('noNote')}
              </MText>
            </MHStack>
            <MHStack justifyBetween style={{ padding: 16 }}>
              <MText color="muted">{t('date')}</MText>
              <MText weight="medium">
                {formatDateTime(transaction.timestamp)}
              </MText>
            </MHStack>
          </MVStack>
        </MVStack>
      </MVStack>
    </MMainLayout>
  )
}
