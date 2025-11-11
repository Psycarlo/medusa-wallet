import type BottomSheet from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import Pencil from '@/components/icons/Pencil'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MEmptyInputButton from '@/components/MEmptyInputButton'
import MOptionSelector from '@/components/MOptionSelector'
import MSheetSelector from '@/components/MSheetSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { Wallet } from '@/types/wallet'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import { getDefaultWallet } from '@/utils/wallet'

export default function Bridge() {
  const wallets = useWalletsStore((state) => state.wallets)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )

  const defaultWallet = getDefaultWallet(wallets)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(
    defaultWallet || undefined
  )

  const [direction, setDirection] = useState('in')
  const [amount, setAmount] = useState(0)
  const [amountOption, setAmountOption] = useState('send')
  const [disabled, setDisabled] = useState(true)

  const bottomSheetWalletRef = useRef<BottomSheet>(null)

  return (
    <MMainLayout>
      {/* Header left swap history here */}
      <Stack.Screen options={{ headerLeft: undefined }} />
      <MVStack itemsCenter gap="xl">
        <MVStack itemsCenter>
          <MVStack gap="none">
            <MText weight="bold" size="4xl" center>
              {t('bridgeTitle1')}
            </MText>
            <MText color="bitcoin" weight="bold" size="4xl" center>
              {t('bridgeTitle2')}
            </MText>
          </MVStack>
        </MVStack>
        <MFormLayout style={{ gap: 16 }}>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('lightningWallet')} />
            <MEmptyInputButton
              showPlaceholder={false}
              placeholder={t('specifyLightningWallet')}
              iconRight={<Pencil />}
              onPress={() => bottomSheetWalletRef.current?.expand()}
            >
              <MText>{selectedWallet?.name}</MText>
            </MEmptyInputButton>
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('amount')} />
            <MEmptyInputButton
              showPlaceholder={!amount}
              placeholder={t('specifyAnAmount')}
              iconRight={<Pencil />}
              onPress={() => {}}
            >
              <MHStack style={{ width: 'auto' }}>
                <MText weight="medium">{formatNumber(amount)} sats</MText>
                <MText color="muted" weight="medium">
                  {fiatUtils.getSymbol(fiatCurrency)}
                  {formatNumber(rate && amount / rate, 2)}
                </MText>
              </MHStack>
            </MEmptyInputButton>
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('direction')} />
            <MOptionSelector
              options={[
                { label: t('onchainToLightning'), value: 'in' },
                { label: t('lightningToOnchain'), value: 'out' }
              ]}
              selected={direction}
              setSelected={setDirection}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('amountOptions')} />
            <MOptionSelector
              options={[
                { label: t('sendSpecifiedAmount'), value: 'send' },
                { label: t('receiveSpecifiedAmount'), value: 'receive' }
              ]}
              selected={amountOption}
              setSelected={setAmountOption}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('onchainAddress')} />
            <MTextInput />
          </MFormLayout.Item>
        </MFormLayout>
        <MButton text={t('createSwap')} disabled={disabled} />
      </MVStack>
      <MBottomSheet
        ref={bottomSheetWalletRef}
        title={t('selectWallet')}
        snapPoints={['55%']}
      >
        <MSheetSelector
          items={wallets.map((wallet) => ({
            id: wallet.id,
            name: wallet.name,
            info1: `${getFormattedBitcoinUnitAmount(wallet.balance)} ${getFormattedBitcoinUnitLabel()}`,
            info2: ''
          }))}
          selectedId={selectedWallet?.id}
          onSelect={(id) => {
            setSelectedWallet(wallets.find((wallet) => wallet.id === id))
            bottomSheetWalletRef.current?.close()
          }}
        />
      </MBottomSheet>
    </MMainLayout>
  )
}
