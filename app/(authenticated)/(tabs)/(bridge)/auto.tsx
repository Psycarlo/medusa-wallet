import type BottomSheet from '@gorhom/bottom-sheet'
import { Stack, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useShallow } from 'zustand/react/shallow'

import History from '@/components/icons/History'
import Pencil from '@/components/icons/Pencil'
import MAmountDisplay from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MEmptyInputButton from '@/components/MEmptyInputButton'
import MIconButton from '@/components/MIconButton'
import MNumPad from '@/components/MNumPad'
import MSheetSelector from '@/components/MSheetSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import useCreateAutoSwap from '@/hooks/mutation/useCreateAutoSwap'
import useBoltzConfig from '@/hooks/query/useBoltzConfig'
import useAmountInput from '@/hooks/useAmountInput'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import { Wallet } from '@/types/wallet'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import validation from '@/utils/validation'
import { getDefaultWallet } from '@/utils/wallet'

export default function Auto() {
  const router = useRouter()
  const wallets = useWalletsStore((state) => state.wallets)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )

  const defaultWallet = getDefaultWallet(wallets)
  const [selectedWalletId, setSelectedWalletId] = useState<Wallet['id']>()
  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ??
    defaultWallet ??
    undefined

  const autoSwapMutation = useCreateAutoSwap(selectedWallet?.adminkey ?? '')

  const [amount, setAmount] = useState(0)
  const { data: boltzConfig, isError: boltzUnavailable } = useBoltzConfig()
  const limits = boltzConfig?.['BTC/BTC'].limits
  const amountOutOfLimits =
    !!limits &&
    amount > 0 &&
    (amount < limits.minimal || amount > limits.maximal)
  const amountInput = useAmountInput(rate, bitcoinUnit)
  const [address, setAddress] = useState('')

  const disabled =
    !boltzConfig ||
    boltzUnavailable ||
    amountOutOfLimits ||
    !selectedWallet ||
    !amount ||
    !address ||
    !validation.isValidBitcoinAddress(address)

  const bottomSheetWalletRef = useRef<BottomSheet>(null)
  const bottomSheetAmountRef = useRef<BottomSheet>(null)

  function handleConfirmAmount() {
    const satsAmount = amountInput.sats
    if (satsAmount > 0) {
      setAmount(satsAmount)
    } else {
      setAmount(0)
      amountInput.reset()
    }
    bottomSheetAmountRef.current?.close()
  }

  function handleClearAmount() {
    setAmount(0)
    amountInput.reset()
    bottomSheetAmountRef.current?.close()
  }

  return (
    <MMainLayout style={{ backgroundColor: Colors.dark }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <MIconButton onPress={() => router.navigate('/swaps')}>
              <History />
            </MIconButton>
          )
        }}
      />
      <KeyboardAwareScrollView
        style={{ marginTop: 16 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <MVStack itemsCenter gap="md">
          <MFormLayout style={{ gap: 12 }}>
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
                onPress={() => bottomSheetAmountRef.current?.expand()}
              >
                <MHStack style={{ width: 'auto' }}>
                  <MText weight="medium">
                    {formatNumber(amount, 0, true)} sats
                  </MText>
                  <MText color="muted" weight="medium">
                    {fiatUtils.getSymbol(fiatCurrency)}
                    {formatNumber(rate && amount / rate, 2)}
                  </MText>
                </MHStack>
              </MEmptyInputButton>
              <MHStack style={{ justifyContent: 'space-between' }}>
                {boltzConfig && (
                  <MText
                    size="xs"
                    color={amountOutOfLimits ? 'danger' : 'muted'}
                  >
                    Min: {formatNumber(boltzConfig['BTC/BTC'].limits.minimal)}
                  </MText>
                )}
                {boltzConfig && (
                  <MText
                    size="xs"
                    color={amountOutOfLimits ? 'danger' : 'muted'}
                  >
                    Max: {formatNumber(boltzConfig['BTC/BTC'].limits.maximal)}
                  </MText>
                )}
              </MHStack>
            </MFormLayout.Item>
            <MFormLayout.Item>
              <MFormLayout.Label label={t('onchainAddress')} />
              <MTextInput
                value={address}
                autoCapitalize="none"
                placeholder={t('specifyAnAddress')}
                onChangeText={(text) => setAddress(text)}
                onBlur={() => setAddress(address.trim())}
              />
            </MFormLayout.Item>
          </MFormLayout>
          {boltzUnavailable && (
            <MText size="sm" color="danger" center>
              {t('swapsUnavailable')}
            </MText>
          )}
          <MButton
            text={t('createAutoSwap')}
            disabled={disabled}
            loading={autoSwapMutation.isPending}
            onPress={() =>
              autoSwapMutation.mutate({
                walletId: selectedWallet?.id ?? '',
                amount,
                address
              })
            }
          />
        </MVStack>
      </KeyboardAwareScrollView>
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
            setSelectedWalletId(id)
            bottomSheetWalletRef.current?.close()
          }}
        />
      </MBottomSheet>
      {/* TODO: Refactor. Also using this same Sheet in receive page. */}
      <MBottomSheet
        ref={bottomSheetAmountRef}
        snapPoints={['76%']}
        title={amount === 0 ? t('specifyAnAmount') : t('changeAmount')}
      >
        <MFormLayout style={{ gap: 16 }}>
          <MFormLayout.Item>
            <MAmountDisplay
              type={amountInput.amountType}
              sats={amountInput.sats}
              amountText={amountInput.amountText}
              fiat={amountInput.fiat}
              fiatCurrency={fiatCurrency}
              rate={rate}
              onChangeType={amountInput.setAmountType}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MNumPad
              type={amountInput.numPadType}
              onKeyPress={amountInput.handleKeyPress}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton text={t('confirmAmount')} onPress={handleConfirmAmount} />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton
              variant="ghost"
              text={t('clearAmount')}
              onPress={handleClearAmount}
            />
          </MFormLayout.Item>
        </MFormLayout>
      </MBottomSheet>
    </MMainLayout>
  )
}
