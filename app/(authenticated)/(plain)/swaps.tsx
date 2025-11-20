import { FlashList } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useRouter } from 'expo-router'

import Close from '@/components/icons/Close'
import Refresh from '@/components/icons/Refresh'
import MIconButton from '@/components/MIconButton'
import MSwapCard from '@/components/MSwapCard'
import MText from '@/components/MText'
import useDeleteAutoSwap from '@/hooks/mutation/useDeleteAutoSwap'
import useAutoSwaps from '@/hooks/query/useAutoSwaps'
import useSwaps from '@/hooks/query/useSwaps'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useWalletsStore } from '@/store/wallets'
import { getDefaultWallet } from '@/utils/wallet'

export default function Swaps() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const wallets = useWalletsStore((state) => state.wallets)

  const defaultwallet = getDefaultWallet(wallets)

  const { data: swaps } = useSwaps(defaultwallet?.adminkey!)
  const { data: autoSwaps } = useAutoSwaps(defaultwallet?.adminkey!)
  const deleteAutoSwapMutation = useDeleteAutoSwap(defaultwallet?.adminkey!)

  const allSwaps = [
    ...(autoSwaps?.map((s) => ({ ...s, kind: 'auto' as const })) || []),
    ...(swaps?.map((s) => ({ ...s, kind: 'normal' as const })) || [])
  ]

  if (!defaultwallet) return <Redirect href="/" />

  return (
    <MMainLayout>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('swapsHistory')}
            </MText>
          ),
          headerLeft: () => (
            <MIconButton onPress={() => router.back()}>
              <Close />
            </MIconButton>
          ),
          headerRight: () => (
            <MIconButton
              onPress={() => {
                queryClient.invalidateQueries({
                  queryKey: ['swaps', 'autoSwaps']
                })
              }}
            >
              <Refresh />
            </MIconButton>
          )
        }}
      />
      <MVStack style={{ flex: 1 }}>
        {/* TODO Add loading */}
        <FlashList
          data={allSwaps}
          renderItem={({ item, index }) => {
            if (item.kind === 'auto') {
              return (
                <MSwapCard
                  kind="auto"
                  direction="out"
                  walletName={
                    wallets.find((wallet) => wallet.id === item.wallet)?.name ||
                    ''
                  }
                  amount={item.amount}
                  address={item.onchain_address}
                  createdAt={item.time}
                  count={item.count}
                  isDeleting={deleteAutoSwapMutation.isPending}
                  onDelete={() => deleteAutoSwapMutation.mutate(item.id)}
                  first={index === 0}
                />
              )
            }

            return (
              <MSwapCard
                kind="normal"
                direction={item.direction as 'in' | 'out'}
                walletName={
                  wallets.find((wallet) => wallet.id === item.wallet)?.name ||
                  ''
                }
                amount={item.amount}
                expectedAmount={item.expected_amount}
                createdAt={item.time}
                status={item.status}
                timeoutBlockHeight={item.timeout_block_height}
                first={index === 0}
              />
            )
          }}
          estimatedItemSize={20}
          ListEmptyComponent={() => (
            <MText color="muted" center>
              {t('noTransactions')}
            </MText>
          )}
        />
      </MVStack>
    </MMainLayout>
  )
}
