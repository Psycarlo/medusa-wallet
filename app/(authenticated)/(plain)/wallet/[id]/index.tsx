import { FlashList } from '@shopify/flash-list'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import CreditCard from '@/components/icons/CreditCard'
import Ellipsis from '@/components/icons/Ellipsis'
import Receive from '@/components/icons/Receive'
import Send from '@/components/icons/Send'
import MActionButton from '@/components/MActionButton'
import MIconButton from '@/components/MIconButton'
import MText from '@/components/MText'
import MTransactionCard from '@/components/MTransactionCard'
import { WALLET_CARD_COLORS } from '@/config/colors'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import type { WalletSearchParams } from '@/types/searchParams'
import fiat from '@/utils/fiat'
import { formatNumber } from '@/utils/format'

export default function Wallet() {
  const router = useRouter()
  const { id } = useLocalSearchParams<WalletSearchParams>()

  const [wallet, walletColors, updateWalletColor] = useWalletsStore(
    useShallow((state) => [
      state.wallets.find((wallet) => wallet.id === id),
      state.walletColors,
      state.updateWalletColor
    ])
  )
  const rate = useFiatStore((state) => state.rate)
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  // Update color on wallets created in lnbits dashboard
  useEffect(() => {
    if (!walletColors[wallet!.id])
      updateWalletColor(wallet!.id, WALLET_CARD_COLORS[0])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!wallet) return <Redirect href="/" />

  return (
    <MMainLayout>
      <Stack.Screen
        options={{
          headerRight: () => (
            <MIconButton
              onPress={() =>
                router.navigate({
                  pathname: '/wallet/[id]/settings',
                  params: { id }
                })
              }
            >
              <Ellipsis />
            </MIconButton>
          )
        }}
      />
      <MVStack itemsCenter style={{ flex: 1 }}>
        <MVStack itemsCenter gap="md">
          <MText size="3xl" weight="bold">
            {wallet.name}
          </MText>
          <MVStack itemsCenter>
            <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
              <MText color="bitcoin" size="2xl" weight="bold">
                {getFormattedBitcoinUnitAmount(wallet.balance)}
              </MText>
              <MText color="muted" size="lg" weight="bold">
                {getFormattedBitcoinUnitLabel()}
              </MText>
            </MHStack>
            <MText>
              {fiat.getSymbol(fiatCurrency)}
              {formatNumber(rate && wallet.balance / rate, 2)}
            </MText>
          </MVStack>
          {/* <MHStack>
            <MVStack itemsCenter style={{ flex: 1, width: '50%' }}>
              <MText>{t('totalAcquired')}</MText>
              <MText size="lg" weight="medium">
                {fiat.getSymbol(fiatCurrency)}
                {formatNumber(
                  rate &&
                    wallet.transactions.reduce((acc, transaction) => {
                      return (
                        acc +
                        (transaction.type === 'in'
                          ? transaction.sats
                          : -transaction.sats)
                      )
                    }, 0) / rate,
                  2
                )}
              </MText>
            </MVStack>
            <MVStack itemsCenter style={{ flex: 1, width: '50%' }}>
              <MText>{t('totalAccrued')}</MText>
              <MText size="lg" weight="medium">
                {fiat.getSymbol(fiatCurrency)}
                {formatNumber(rate && wallet.balance / rate, 2)}
              </MText>
            </MVStack>
          </MHStack> */}
        </MVStack>
        <MHStack justifyBetween style={{ marginVertical: 16 }}>
          <MActionButton
            text={t('receive')}
            onPress={() =>
              router.navigate({
                pathname: '/receive',
                params: { walletId: id }
              })
            }
          >
            <Receive />
          </MActionButton>
          <MActionButton
            text={t('send')}
            onPress={() =>
              router.navigate({ pathname: '/camera', params: { walletId: id } })
            }
          >
            <Send />
          </MActionButton>
          <MActionButton
            text={t('buy')}
            onPress={() => router.navigate('/buy')}
          >
            <CreditCard width={16} height={16} active />
          </MActionButton>
        </MHStack>
        <MVStack style={{ flex: 1 }}>
          <MText size="lg" weight="bold">
            {t('transactions')}
          </MText>
          <FlashList
            data={wallet.transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MTransactionCard
                fiat={fiatCurrency}
                transaction={item}
                currentFiatPrice={rate && item.sats / rate}
                first={index === 0}
                last={index === wallet.transactions!.length - 1}
                onPress={() => {
                  router.navigate({
                    pathname: '/wallet/[id]/transaction/[tid]',
                    params: { id: item.walletId, tid: item.id }
                  })
                }}
              />
            )}
            ListEmptyComponent={() => (
              <MText color="muted" center>
                {t('noTransactions')}
              </MText>
            )}
            estimatedItemSize={60}
          />
        </MVStack>
      </MVStack>
    </MMainLayout>
  )
}
