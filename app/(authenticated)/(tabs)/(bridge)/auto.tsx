import type BottomSheet from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import History from '@/components/icons/History'
import Pencil from '@/components/icons/Pencil'
import MAmountDisplay, { MAmountDisplayType } from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MEmptyInputButton from '@/components/MEmptyInputButton'
import MIconButton from '@/components/MIconButton'
import MNumPad, { Keys } from '@/components/MNumPad'
import MSheetSelector from '@/components/MSheetSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import useCreateAutoSwap from '@/hooks/mutation/useCreateAutoSwap'
import useRate from '@/hooks/query/useRate'
import useUser from '@/hooks/query/useUser'
import useFormatBitcoinUnit from '@/hooks/useFormatBitcoinUnit'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { Colors } from '@/styles'
import { Wallet } from '@/types/wallet'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import validation from '@/utils/validation'
import { getDefaultWallet } from '@/utils/wallet'

export default function Auto() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const { data: userData } = useUser(accessToken)
  const wallets = userData?.wallets ?? []
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()
  const { data: rate } = useRate()
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )

  const { data: boltzConfig } = useQuery({
    queryKey: ['boltz-config'],
    queryFn: () => lnbits.getBoltzConfig()
  })

  const defaultWallet = getDefaultWallet(wallets)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(
    defaultWallet || undefined
  )

  const autoSwapMutation = useCreateAutoSwap(selectedWallet?.adminkey!)

  const [amount, setAmount] = useState(0)
  const [amountType, setAmountType] = useState<MAmountDisplayType>('btc')
  const [localAmount, setLocalAmount] = useState('0')
  const [localFiat, setLocalFiat] = useState('0')
  const [address, setAddress] = useState('')

  const disabled =
    !amount || !address || !validation.isValidBitcoinAddress(address)

  const bottomSheetWalletRef = useRef<BottomSheet>(null)
  const bottomSheetAmountRef = useRef<BottomSheet>(null)

  function syncSatsWithFiat(fiat: string) {
    const amountInSats = Math.ceil(Number(fiat) * (rate ?? 0))
    setLocalAmount(String(amountInSats))
  }

  function syncFiatWithSats(sats: string) {
    const amountInFiat = rate ? Number(sats) / rate : 0
    setLocalFiat(amountInFiat.toFixed(2))
  }

  // TODO: Refactor/Extract
  function handleOnKeyPress(key: Keys) {
    if (amountType === 'btc') {
      if (key === 'DEL') {
        const newValue = localAmount.length > 1 ? localAmount.slice(0, -1) : '0'
        syncFiatWithSats(newValue)
        setLocalAmount(newValue)
      } else if (key === ',') {
        if (!localAmount.includes('.')) {
          setLocalAmount((prev) => (prev === '0' ? '0.' : prev + '.'))
        }
      } else if (typeof key === 'number') {
        setLocalAmount((prev) => {
          const newValue = prev === '0' ? key.toString() : prev + key.toString()
          syncFiatWithSats(newValue)
          return newValue
        })
      }
    } else if (amountType === 'fiat') {
      if (key === 'DEL') {
        const newValue = localFiat.length > 1 ? localFiat.slice(0, -1) : '0'
        syncSatsWithFiat(newValue)
        setLocalFiat(newValue)
      } else if (key === ',') {
        if (!localFiat.includes('.')) {
          setLocalFiat((prev) => (prev === '0' ? '0.' : prev + '.'))
        }
      } else if (typeof key === 'number') {
        setLocalFiat((prev) => {
          const decimalParts = prev.split('.')
          const hasDecimal = decimalParts.length > 1
          const decimalPlaces = hasDecimal ? decimalParts[1].length : 0

          if (hasDecimal && decimalPlaces >= 2) return prev

          const newValue = prev === '0' ? key.toString() : prev + key.toString()
          syncSatsWithFiat(newValue)
          return newValue
        })
      }
    }
  }

  function handleConfirmAmount() {
    const satsAmount = Number(localAmount)
    if (satsAmount && satsAmount > 0) {
      setAmount(satsAmount)
    } else {
      setAmount(0)
      setLocalAmount('0')
    }
    bottomSheetAmountRef.current?.close()
  }

  function handleClearAmount() {
    setAmount(0)
    setLocalAmount('0')
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
      <ScrollView style={{ marginTop: 16 }}>
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
                    {formatNumber(rate ? amount / rate : 0, 2)}
                  </MText>
                </MHStack>
              </MEmptyInputButton>
              <MHStack style={{ justifyContent: 'space-between' }}>
                {boltzConfig && (
                  <MText size="xs" color="muted">
                    Min: {formatNumber(boltzConfig['BTC/BTC'].limits.minimal)}
                  </MText>
                )}
                {boltzConfig && (
                  <MText size="xs" color="muted">
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
          <MButton
            text={t('createAutoSwap')}
            disabled={disabled}
            loading={autoSwapMutation.isPending}
            onPress={() =>
              autoSwapMutation.mutate({
                walletId: selectedWallet?.id!,
                amount,
                address
              })
            }
          />
        </MVStack>
      </ScrollView>
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
      {/* TODO: Refactor. Also using this same Sheet in receive page. */}
      <MBottomSheet
        ref={bottomSheetAmountRef}
        snapPoints={['76%']}
        title={amount === 0 ? t('specifyAnAmount') : t('changeAmount')}
      >
        <MFormLayout style={{ gap: 16 }}>
          <MFormLayout.Item>
            <MAmountDisplay
              type={amountType}
              sats={
                Number(localAmount) *
                (bitcoinUnit === 'btc' ? SATOSHIS_IN_BITCOIN : 1)
              }
              fiat={Number(localFiat)}
              fiatCurrency={fiatCurrency}
              rate={rate ?? 0}
              onChangeType={(type) => setAmountType(type)}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MNumPad type={bitcoinUnit} onKeyPress={handleOnKeyPress} />
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
