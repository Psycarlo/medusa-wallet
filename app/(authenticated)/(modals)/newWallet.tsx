import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import MButton from '@/components/MButton'
import MColorSelector from '@/components/MColorSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import { WALLET_CARD_COLORS } from '@/config/colors'
import { MAX_WALLET_NAME_LENGTH } from '@/config/wallet'
import MFormLayout from '@/layouts/MFormLayout'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useWalletsStore } from '@/store/wallets'

export default function NewWallet() {
  const router = useRouter()
  const [wallets, addWallet, updateWalletColor] = useWalletsStore(
    useShallow((state) => [
      state.wallets,
      state.addWallet,
      state.updateWalletColor
    ])
  )

  const [walletName, setWalletName] = useState('')
  const [walletColorId, setWalletColorId] = useState(WALLET_CARD_COLORS[0].id)

  const createWalletMutation = useMutation({
    mutationKey: ['createWallet'],
    mutationFn: () => lnbits.createWallet(walletName, wallets[0].adminkey),
    onSuccess: (wallet) => {
      if (!wallet) return

      addWallet(wallet)

      const walletColor = WALLET_CARD_COLORS.find(
        (color) => color.id === walletColorId
      )
      if (walletColor) updateWalletColor(wallet.id, walletColor)
      else updateWalletColor(wallet.id, WALLET_CARD_COLORS[0])

      router.navigate('/')
    }
  })

  return (
    <MMainLayout withPaddingBottom>
      <MVStack itemsCenter justifyBetween>
        <MVStack gap="md">
          <MVStack gap="none">
            <MText weight="bold" size="4xl" center>
              {t('createWalletTitle1')}
            </MText>
            <MText color="bitcoin" weight="bold" size="4xl" center>
              {t('createWalletTitle2')}
            </MText>
          </MVStack>
          <MVStack gap="none">
            <MText color="muted" center>
              {t('createWalletDescription1')}
            </MText>
            <MText color="muted" center>
              {t('createWalletDescription2')}
            </MText>
          </MVStack>
          <MFormLayout>
            <MFormLayout.Item>
              <MFormLayout.WithHint
                hint={`${walletName.length}/${MAX_WALLET_NAME_LENGTH}`}
              >
                <MFormLayout.Label label={t('name')} />
              </MFormLayout.WithHint>
              <MTextInput
                placeholder={t('enterWalletName')}
                maxLength={MAX_WALLET_NAME_LENGTH}
                onChangeText={(text) => setWalletName(text)}
              />
            </MFormLayout.Item>
            <MFormLayout.Item>
              <MFormLayout.Label label={t('color')} />
              <MColorSelector
                colors={WALLET_CARD_COLORS}
                selected={walletColorId}
                onSelect={(id) => setWalletColorId(id)}
              />
            </MFormLayout.Item>
          </MFormLayout>
        </MVStack>
        <MButton
          text={t('createWallet')}
          loading={createWalletMutation.isPending}
          disabled={!walletName}
          onPress={() => createWalletMutation.mutate()}
        />
      </MVStack>
    </MMainLayout>
  )
}
