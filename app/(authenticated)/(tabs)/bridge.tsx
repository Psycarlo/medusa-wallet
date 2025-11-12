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
import MOptionSelector from '@/components/MOptionSelector'
import MSheetSelector from '@/components/MSheetSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
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
  const router = useRouter()
  const wallets = useWalletsStore((state) => state.wallets)
  const { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel } =
    useFormatBitcoinUnit()
  const rate = useFiatStore((state) => state.rate)
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

  const [direction, setDirection] = useState('in')
  const [amount, setAmount] = useState(0)
  const [amountType, setAmountType] = useState<MAmountDisplayType>('btc')
  const [localAmount, setLocalAmount] = useState('0')
  const [localFiat, setLocalFiat] = useState('0')
  const [amountOption, setAmountOption] = useState('send')
  const [address, setAddress] = useState('')

  const disabled = !amount || !direction || !amountOption || !address

  const bottomSheetWalletRef = useRef<BottomSheet>(null)
  const bottomSheetAmountRef = useRef<BottomSheet>(null)

  function syncSatsWithFiat(fiat: string) {
    const amountInSats = Math.ceil(Number(fiat) * rate)
    setLocalAmount(String(amountInSats))
  }

  function syncFiatWithSats(sats: string) {
    const amountInFiat = Number(sats) / rate
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

  function handlePressMax() {
    if (!selectedWallet) return
    setAmount(selectedWallet.balance)
    setLocalAmount(String(selectedWallet.balance))
  }

  return (
    <MMainLayout>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <MIconButton onPress={() => router.navigate('/swaps')}>
              <History />
            </MIconButton>
          )
        }}
      />
      <ScrollView>
        <MVStack itemsCenter gap="md">
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
                  <MText weight="medium">{formatNumber(amount)} sats</MText>
                  <MText color="muted" weight="medium">
                    {fiatUtils.getSymbol(fiatCurrency)}
                    {formatNumber(rate && amount / rate, 2)}
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
              <MTextInput
                value={address}
                autoCapitalize="none"
                placeholder={t('specifyAnAddress')}
                onChangeText={(text) => setAddress(text)}
                onBlur={() => setAddress(address.trim())}
              />
              <MHStack style={{ justifyContent: 'flex-end' }}>
                <MText size="xs" color="muted">
                  {t('onchainToLnAddressInfo')}
                </MText>
              </MHStack>
            </MFormLayout.Item>
          </MFormLayout>
          <MButton text={t('createSwap')} disabled={disabled} />
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
              rate={rate}
              withMax={direction === 'out'}
              onChangeType={(type) => setAmountType(type)}
              onPressMax={handlePressMax}
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
