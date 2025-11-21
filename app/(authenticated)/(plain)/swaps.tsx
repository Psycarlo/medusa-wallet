import BottomSheet from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import { useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { z } from 'zod'

import Close from '@/components/icons/Close'
import Refresh from '@/components/icons/Refresh'
import MBottomSheet from '@/components/MBottomSheet'
import MIconButton from '@/components/MIconButton'
import MSwapCard from '@/components/MSwapCard'
import MText from '@/components/MText'
import useDeleteAutoSwap from '@/hooks/mutation/useDeleteAutoSwap'
import useAutoSwaps from '@/hooks/query/useAutoSwaps'
import useCurrentBlockHeight from '@/hooks/query/useCurrentBlockHeight'
import useSwaps from '@/hooks/query/useSwaps'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { SwapSchema } from '@/schemas/lnbits'
import { useWalletsStore } from '@/store/wallets'
import { getDefaultWallet } from '@/utils/wallet'
import MQRCode from '@/components/MQRCode'
import MFormLayout from '@/layouts/MFormLayout'
import MAddressCopy from '@/components/MAddressCopy'
import { formatNumber } from '@/utils/format'
import { View } from 'react-native'
import { Colors } from '@/styles'

export default function Swaps() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const wallets = useWalletsStore((state) => state.wallets)

  const defaultwallet = getDefaultWallet(wallets)

  const { data: blockHeight } = useCurrentBlockHeight()
  const { data: swaps } = useSwaps(defaultwallet?.adminkey!)
  const { data: autoSwaps } = useAutoSwaps(defaultwallet?.adminkey!)
  const deleteAutoSwapMutation = useDeleteAutoSwap(defaultwallet?.adminkey!)

  const allSwaps = [
    ...(autoSwaps?.map((s) => ({ ...s, kind: 'auto' as const })) || []),
    ...(swaps?.map((s) => ({ ...s, kind: 'normal' as const })) || [])
  ]

  const [selectedSwap, setSelectedSwap] = useState<z.infer<typeof SwapSchema>>()
  const bottomSheetOnchainDetailsRef = useRef<BottomSheet>(null)

  function handleSelectSwap(id: string) {
    const swap = swaps?.find((swap) => swap.id === id)
    if (swap) setSelectedSwap(swap)
    bottomSheetOnchainDetailsRef.current?.expand()
  }

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
                queryClient.invalidateQueries({ queryKey: ['block-height'] })
                queryClient.invalidateQueries({ queryKey: ['swaps'] })
                queryClient.invalidateQueries({ queryKey: ['autoSwaps'] })
              }}
            >
              <Refresh />
            </MIconButton>
          )
        }}
      />
      <MVStack style={{ flex: 1 }}>
        <MVStack itemsCenter gap="xs">
          <MText color="muted">{t('currentBlockHeight')}</MText>
          <MText size="xl" weight="semibold">
            {blockHeight}
          </MText>
        </MVStack>
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
                direction={item.direction === 'receive' ? 'in' : 'out'}
                walletName={
                  wallets.find((wallet) => wallet.id === item.wallet)?.name ||
                  ''
                }
                amount={item.amount}
                expectedAmount={item.expected_amount}
                createdAt={item.time}
                status={item.status}
                timeoutBlockHeight={item.timeout_block_height}
                currentBlockHeight={blockHeight}
                first={index === 0}
                onDetails={() => handleSelectSwap(item.id)}
              />
            )
          }}
          estimatedItemSize={20}
          ListEmptyComponent={() => (
            <MText color="muted" center>
              {t('noSwaps')}
            </MText>
          )}
        />
      </MVStack>
      <MBottomSheet
        ref={bottomSheetOnchainDetailsRef}
        snapPoints={['82%']}
        title={t('onchainDetails')}
      >
        {selectedSwap && (
          <MVStack itemsCenter>
            {selectedSwap.timeout_block_height <= (blockHeight || 0) &&
              selectedSwap.status === 'pending' && (
                <MText size="sm" color="danger">
                  {t('timeoutReached')}
                </MText>
              )}
            {selectedSwap && <MQRCode value={selectedSwap.address} />}
            <MText color="muted" size="sm">
              {t('boltzFee', {
                sats: selectedSwap.expected_amount - selectedSwap.amount
              })}
            </MText>
            <MFormLayout>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('expectedAmount')} />
                <MAddressCopy
                  address={formatNumber(selectedSwap.expected_amount)}
                />
              </MFormLayout.Item>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('onchainAddress')} />
                <MAddressCopy address={selectedSwap.address} />
              </MFormLayout.Item>
            </MFormLayout>
          </MVStack>
        )}
      </MBottomSheet>
    </MMainLayout>
  )
}
