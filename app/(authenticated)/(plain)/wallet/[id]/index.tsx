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
import usePayments from '@/hooks/query/usePayments'
import useRate from '@/hooks/query/useRate'
import useUser from '@/hooks/query/useUser'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import type { WalletSearchParams } from '@/types/searchParams'
import fiat from '@/utils/fiat'
import { formatNumber } from '@/utils/format'

export default function Wallet() {
  const router = useRouter()
  const { id } = useLocalSearchParams<WalletSearchParams>()

  const accessToken = useAuthStore((state) => state.accessToken)
  const [walletColors, updateWalletColor] = useWalletsStore(
    useShallow((state) => [state.walletColors, state.updateWalletColor])
  )
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()

  const { data: userData } = useUser(accessToken)
  const wallet = userData?.wallets.find((w) => w.id === id)

  const { data: rate } = useRate()

  const { data: payments } = usePayments(
    wallet ? [wallet.inkey] : [],
    !!wallet
  )
  const transactions = payments?.[0] ?? []

  // Update color on wallets created in lnbits dashboard
  useEffect(() => {
    if (wallet && !walletColors[wallet.id])
      updateWalletColor(wallet.id, WALLET_CARD_COLORS[0])
  }, [wallet?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
              {formatNumber(rate ? wallet.balance / rate : 0, 2)}
            </MText>
          </MVStack>
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
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MTransactionCard
                fiat={fiatCurrency}
                transaction={item}
                currentFiatPrice={rate ? item.sats / rate : 0}
                first={index === 0}
                last={index === transactions.length - 1}
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
          />
        </MVStack>
      </MVStack>
    </MMainLayout>
  )
}
