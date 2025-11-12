import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useRouter } from 'expo-router'

import lnbits from '@/api/lnbits'
import Close from '@/components/icons/Close'
import MIconButton from '@/components/MIconButton'
import MText from '@/components/MText'
import MMainLayout from '@/layouts/MMainLayout'
import { useWalletsStore } from '@/store/wallets'
import { getDefaultWallet } from '@/utils/wallet'

export default function Swaps() {
  const router = useRouter()

  const wallets = useWalletsStore((state) => state.wallets)

  const defaultwallet = getDefaultWallet(wallets)

  const { data: swaps } = useQuery({
    queryKey: ['swaps'],
    queryFn: () => lnbits.listSwaps(defaultwallet?.inkey!)
  })

  if (!defaultwallet) return <Redirect href="/" />

  return (
    <MMainLayout>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <MIconButton onPress={() => router.back()}>
              <Close />
            </MIconButton>
          )
        }}
      />
      <MText>Swaps</MText>
    </MMainLayout>
  )
}
