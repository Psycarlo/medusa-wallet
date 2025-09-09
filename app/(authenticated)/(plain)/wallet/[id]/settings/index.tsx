import { useMutation } from '@tanstack/react-query'
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
import MFormLayout from '@/layouts/MFormLayout'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import type { WalletSearchParams } from '@/types/searchParams'
import { isDefaultWallet as getIsDefaultWallet } from '@/utils/wallet'

export default function WalletSettings() {
  const router = useRouter()
  const { id } = useLocalSearchParams<WalletSearchParams>()

  // TODO: Get wallet keys/name via api
  // TODO: Get wallet color via api
  // TODO: Discard zustand since it's server state
  // TODO: Add Loading: loaders, skeletons, etc.

  const [
    wallet,
    wallets,
    walletColors,
    updateWalletName,
    updateWalletColor,
    deleteWallet
  ] = useWalletsStore(
    useShallow((state) => [
      state.wallets.find((wallet) => wallet.id === id),
      state.wallets,
      state.walletColors,
      state.updateWalletName,
      state.updateWalletColor,
      state.deleteWallet
    ])
  )

  const [newWalletName, setNewWalletName] = useState(wallet?.name || '')
  const [walletColorId, setWalletColorId] = useState(
    walletColors[wallet!.id].id
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [hasNameChanged, setHasNameChanged] = useState(false)
  const [hasColorChanged, setHasColorChanged] = useState(false)

  const isDefaultWallet = useMemo(
    () => getIsDefaultWallet(id, wallets),
    [id, wallets]
  )

  const updateWalletNameMutation = useMutation({
    mutationKey: ['updateWalletName'],
    mutationFn: () => lnbits.updateWalletName(newWalletName, wallet!.adminkey),
    onSuccess: (wallet) => {
      if (wallet) updateWalletName(wallet)
    }
  })

  const deleteWalletMutation = useMutation({
    mutationKey: ['deleteWallet'],
    mutationFn: () => lnbits.deleteWallet(wallet!.id, wallet!.adminkey),
    onSuccess: () => {
      router.navigate('/')
      if (wallet) deleteWallet(wallet)
    }
  })

  function handleOnChangeNewWalletNameText(text: string) {
    setNewWalletName(text)
    setHasChanges(text !== wallet?.name)
    setHasNameChanged(text !== wallet?.name)
  }

  function handleOnChangeNewWalletColorId(id: string) {
    setWalletColorId(id)
    setHasChanges(id !== walletColors[wallet!.id].id)
    setHasColorChanged(id !== walletColors[wallet!.id].id)
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
            <MFormLayout.Label label="Name" />
            <MTextInput
              value={newWalletName}
              placeholder="Enter wallet name"
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
            text="Save changes"
            loading={updateWalletNameMutation.isPending}
            disabled={!hasChanges || !newWalletName}
            onPress={() => handleUpdateWallet()}
          />
          <MButton
            text="Delete Wallet"
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
