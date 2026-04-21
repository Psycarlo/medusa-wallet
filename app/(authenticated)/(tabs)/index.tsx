import { FlashList } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import CreditCard from '@/components/icons/CreditCard'
import Receive from '@/components/icons/Receive'
import Send from '@/components/icons/Send'
import MActionButton from '@/components/MActionButton'
import MNewWalletButton from '@/components/MNewWalletButton'
import MText from '@/components/MText'
import MTransactionCard from '@/components/MTransactionCard'
import MWalletCard from '@/components/MWalletCard'
import MWalletCardSkeleton from '@/components/skeletons/MWalletCardSkeleton'
import { APP_VERSION } from '@/constants/version'
// import usePaginatedPayments from '@/hooks/query/usePaginatedPayments'
import usePayments from '@/hooks/query/usePayments'
import useRate from '@/hooks/query/useRate'
import useUser from '@/hooks/query/useUser'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import useGetMedusaLatestVersion from '@/hooks/useGetMedusaLatestVersion'
import useLogout from '@/hooks/useLogout'
import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useVersionStore } from '@/store/version'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import { mainLayoutPaddingHorizontal } from '@/styles/layout'
import fiat from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import { withHapticsSelection } from '@/utils/haptics'
import sort from '@/utils/sort'
import version from '@/utils/version'

export default function Lightning() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const walletColors = useWalletsStore((state) => state.walletColors)
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  const [dismissedVersions, addDismissedVersion] = useVersionStore(
    useShallow((state) => [state.dismissedVersions, state.addDismissedVersion])
  )
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()
  const logout = useLogout()
  const { data: medusaLatestVersion, isSuccess: medusaLatestVersionSuccess } =
    useGetMedusaLatestVersion()

  const {
    data: userData,
    isSuccess: userIsSuccess,
    isError: userIsError,
    error: userError,
    isFetching: userIsFetching,
    refetch: userRefetch
  } = useUser(accessToken)

  const { data: rate } = useRate()

  const {
    data: payments,
    isFetching: paymentsIsFetching,
    refetch: paymentsRefetch
  } = usePayments(accessToken, !!userData)

  const totalBalance = userData?.totalBalance ?? 0
  const totalFiat = rate && totalBalance ? totalBalance / rate : 0

  const walletsSorted = [...(userData?.wallets ?? [])].sort((a, b) =>
    sort.sortTimestampAsc(a.createdAt, b.createdAt)
  )

  const allTransactionsSorted = (payments ?? [])
    .filter(Boolean)
    .sort((a, b) => sort.sortTimestampDesc(a.timestamp, b.timestamp))

  const wsSubscriptions = useRef(new Map<string, WebSocket>())

  useEffect(() => {
    if (userIsSuccess && userData && !userIsFetching) {
      for (const wallet of userData.wallets) {
        if (!wsSubscriptions.current.has(wallet.inkey)) {
          const ws = lnbits.subscribeInkeyWs(wallet.inkey, (amount) => {
            toast.success(
              `${amount > 0 ? '+' : ''}${formatNumber(amount)} sats!`
            )
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            queryClient.invalidateQueries({ queryKey: ['paginated-payments'] })
          })
          wsSubscriptions.current.set(wallet.inkey, ws)
        }
      }

      // Clean up subscriptions for wallets no longer in userData.wallets
      wsSubscriptions.current.forEach((ws, inkey) => {
        if (!userData.wallets.some((wallet) => wallet.inkey === inkey)) {
          ws.close()
          wsSubscriptions.current.delete(inkey)
        }
      })
    }

    const currentSubs = wsSubscriptions.current

    return () => {
      currentSubs.forEach((ws) => ws.close())
      currentSubs.clear()
    }
  }, [userIsSuccess, userIsFetching]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!medusaLatestVersion) return
    const latestVersion = medusaLatestVersion.replace(/^v/, '')
    if (
      version.gt(latestVersion, APP_VERSION) &&
      !dismissedVersions.includes(latestVersion)
    ) {
      const id = toast(t('newRelease'), {
        action: {
          label: 'Download',
          onClick: () => {
            addDismissedVersion(latestVersion)
            Linking.openURL('https://medusa.bz')
          }
        },
        cancel: {
          label: t('dismiss'),
          onClick: () => {
            addDismissedVersion(latestVersion)
            toast.dismiss(id)
          }
        }
      })
    }
  }, [medusaLatestVersionSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function handleUserError() {
      if (userIsError && userError) {
        toast(t('errorSessionExpired'))
        await logout()
      }
    }

    handleUserError()
  }, [userIsError]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <MVStack gap="xl" style={{ flex: 1 }}>
        <MVStack
          gap="xs"
          itemsCenter
          style={{ paddingHorizontal: mainLayoutPaddingHorizontal }}
        >
          <MText color="muted">{t('totalBalance')}</MText>
          <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
            <MText weight="bold" size="3xl">
              {getFormattedBitcoinUnitAmount(totalBalance)}
            </MText>
            <MText color="muted" weight="bold" size="lg">
              {getFormattedBitcoinUnitLabel()}
            </MText>
          </MHStack>
          <MText>
            {fiat.getSymbol(fiatCurrency)}
            {formatNumber(totalFiat, 2)}
          </MText>
        </MVStack>
        <MHStack
          justifyBetween
          style={{ paddingHorizontal: mainLayoutPaddingHorizontal }}
        >
          <MActionButton
            text={t('receive')}
            onPress={() => router.navigate(`/receive`)}
          >
            <Receive />
          </MActionButton>
          <MActionButton
            text={t('send')}
            onPress={() => router.navigate('/camera')}
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
        <MVStack>
          <MText
            size="xl"
            weight="bold"
            style={{ paddingLeft: mainLayoutPaddingHorizontal }}
          >
            {t('wallets')}
          </MText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <MHStack
              style={{
                paddingLeft: mainLayoutPaddingHorizontal,
                paddingRight: 32
              }}
            >
              {walletsSorted.length === 0 && <MWalletCardSkeleton />}
              {walletsSorted.length > 0 &&
                walletsSorted.map((wallet) => {
                  const walletTransactions = (payments ?? []).filter(
                    (t) => t.walletId === wallet.id
                  )
                  const latestTransaction =
                    walletTransactions.length > 0
                      ? walletTransactions.reduce((latest, current) =>
                          current.timestamp > latest.timestamp
                            ? current
                            : latest
                        ).timestamp
                      : 0

                  return (
                    <MWalletCard
                      key={wallet.id}
                      name={wallet.name}
                      sats={wallet.balance}
                      fiat={fiatCurrency}
                      fiatAmount={formatNumber(
                        rate ? wallet.balance / rate : 0,
                        2
                      )}
                      latestTransaction={latestTransaction}
                      color={walletColors[wallet.id]}
                      onPress={() =>
                        withHapticsSelection(() =>
                          router.push(`/wallet/${wallet.id}`)
                        )
                      }
                    />
                  )
                })}
              <MNewWalletButton
                onPress={() =>
                  withHapticsSelection(() => router.push('/newWallet'))
                }
              />
            </MHStack>
          </ScrollView>
        </MVStack>
        <MVStack
          style={{
            paddingHorizontal: mainLayoutPaddingHorizontal,
            flex: 1
          }}
        >
          <MText size="xl" weight="bold">
            {t('transactions')}
          </MText>
          <FlashList
            data={allTransactionsSorted}
            renderItem={({ item, index }) => (
              <MTransactionCard
                fiat={fiatCurrency}
                transaction={item}
                currentFiatPrice={rate ? item.sats / rate : 0}
                first={index === 0}
                last={index === allTransactionsSorted.length - 1}
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
            refreshControl={
              <RefreshControl
                refreshing={userIsFetching || paymentsIsFetching}
                onRefresh={() => {
                  userRefetch()
                  paymentsRefetch()
                }}
                colors={[Colors.white, Colors.bitcoin]}
                progressBackgroundColor={Colors.grayDarker}
              />
            }
          />
        </MVStack>
      </MVStack>
    </>
  )
}
