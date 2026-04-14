import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import MButton from '@/components/MButton'
import MColorSelector from '@/components/MColorSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import { WALLET_CARD_COLORS } from '@/config/colors'
import useUser from '@/hooks/query/useUser'
import MFormLayout from '@/layouts/MFormLayout'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import type { WalletSearchParams } from '@/types/searchParams'
import { isDefaultWallet as getIsDefaultWallet } from '@/utils/wallet'

export default function WalletSettings() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = useLocalSearchParams<WalletSearchParams>()

  const accessToken = useAuthStore((state) => state.accessToken)
  const [walletColors, updateWalletColor] = useWalletsStore(
    useShallow((state) => [state.walletColors, state.updateWalletColor])
  )

  const { data: userData } = useUser(accessToken)
  const wallet = userData?.wallets.find((w) => w.id === id)
  const [newWalletName, setNewWalletName] = useState(wallet?.name || '')
  const [walletColorId, setWalletColorId] = useState(
    (wallet && walletColors[wallet.id]?.id) ?? WALLET_CARD_COLORS[0].id
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [hasNameChanged, setHasNameChanged] = useState(false)
  const [hasColorChanged, setHasColorChanged] = useState(false)

  const isDefaultWallet = useMemo(
    () => getIsDefaultWallet(id, userData?.wallets ?? []),
    [id, userData?.wallets]
  )

  const updateWalletNameMutation = useMutation({
    mutationKey: ['updateWalletName'],
    mutationFn: () => lnbits.updateWalletName(newWalletName, wallet!.adminkey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  const deleteWalletMutation = useMutation({
    mutationKey: ['deleteWallet'],
    mutationFn: () => lnbits.deleteWallet(wallet!.id, wallet!.adminkey),
    onSuccess: () => {
      router.navigate('/')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  function handleOnChangeNewWalletNameText(text: string) {
    setNewWalletName(text)
    setHasChanges(text !== wallet?.name)
    setHasNameChanged(text !== wallet?.name)
  }

  function handleOnChangeNewWalletColorId(id: string) {
    setWalletColorId(id)
    setHasChanges(id !== walletColors[wallet!.id]?.id)
    setHasColorChanged(id !== walletColors[wallet!.id]?.id)
  }

  function handleUpdateWallet() {
    if (hasNameChanged) updateWalletNameMutation.mutate()
    if (hasColorChanged) {
      const color = WALLET_CARD_COLORS.find(
        (_color) => _color.id === walletColorId
      )
      if (color) updateWalletColor(wallet!.id, color)
    }
    router.back()
  }

  function alertDeleteWallet() {
    if (isDefaultWallet) return toast.error(t('deleteWalletDefaultWarning'))

    return Alert.alert(t('deleteWalletPrompt'), t('deleteWalletDescription'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel'
      },
      { text: t('delete'), onPress: () => deleteWalletMutation.mutate() }
    ])
  }

  if (!wallet) return <Redirect href="/" />

  return (
    <MMainLayout withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('walletSettings')}
            </MText>
          )
        }}
      />
      <MVStack justifyBetween>
        <MFormLayout>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('name')} />
            <MTextInput
              value={newWalletName}
              placeholder={t('enterWalletName')}
              onChangeText={(text) => handleOnChangeNewWalletNameText(text)}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('color')} />
            <MColorSelector
              colors={WALLET_CARD_COLORS}
              selected={walletColorId}
              onSelect={(id) => handleOnChangeNewWalletColorId(id)}
            />
          </MFormLayout.Item>
        </MFormLayout>
        <MVStack>
          <MButton
            text={t('saveChanges')}
            loading={updateWalletNameMutation.isPending}
            disabled={!hasChanges || !newWalletName}
            onPress={() => handleUpdateWallet()}
          />
          <MButton
            text={t('deleteWallet')}
            variant="danger"
            underlayColor={Colors.transparent}
            loading={deleteWalletMutation.isPending}
            onPress={() => alertDeleteWallet()}
          />
        </MVStack>
      </MVStack>
    </MMainLayout>
  )
}
