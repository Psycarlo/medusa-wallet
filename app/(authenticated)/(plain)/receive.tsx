import type BottomSheet from '@gorhom/bottom-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Keyboard, TextInput } from 'react-native'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import Close from '@/components/icons/Close'
import Pencil from '@/components/icons/Pencil'
import MAddressCopy from '@/components/MAddressCopy'
import MAmountDisplay, {
  type MAmountDisplayType
} from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MEmptyInputButton from '@/components/MEmptyInputButton'
import MIconButton from '@/components/MIconButton'
import MNumPad, { type Keys } from '@/components/MNumPad'
import MQRCode from '@/components/MQRCode'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import MTimer from '@/components/MTimer'
import { EXPIRATION_TIME } from '@/config/medusa'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { type ReceiveSearchParams } from '@/types/searchParams'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import { getPaylinkAddress } from '@/utils/medusa'
import { getDefaultWallet, isDefaultWallet } from '@/utils/wallet'

// If no walletId is provided, the default wallet will be used
// If is the default wallet, we display the paylink lnurl
// If is not the default wallet, we display bolt11 with 1 sat
// If is the default wallet and user wants to add amount, we display
// bolt11 with that amount (and label if provided)

export default function Receive() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { walletId } = useLocalSearchParams<ReceiveSearchParams>()
  const [wallets, paylink] = useWalletsStore(
    useShallow((state) => [state.wallets, state.paylink])
  )
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )
  const defaultWallet = walletId ? isDefaultWallet(walletId, wallets) : true

  const currentWallet = walletId
    ? wallets.find((wallet) => wallet.id === walletId)
    : getDefaultWallet(wallets)

  const [addressCopyType, setAddressCopyType] = useState<'address' | 'invoice'>(
    'address'
  )
  const [qrCodeValue, setQrCodeValue] = useState('')
  const [isQrCodePlaceholder, setIsQrCodePlaceholder] = useState(false)

  const [amount, setAmount] = useState(0)
  const [comment, setComment] = useState('')

  const [localAmount, setLocalAmount] = useState('0')
  const [localFiat, setLocalFiat] = useState('0')
  const [localComment, setLocalComment] = useState('')

  const sheetCommentRef = useRef<TextInput>(null)
  const bottomSheetAmountRef = useRef<BottomSheet>(null)
  const bottomSheetCommentRef = useRef<BottomSheet>(null)

  const [amountType, setAmountType] = useState<MAmountDisplayType>('btc')

  function handleBottomSheetNoteOpen() {
    bottomSheetCommentRef.current?.expand()
    sheetCommentRef.current?.focus()
  }

  function syncSatsWithFiat(fiat: string) {
    const amountInSats = Math.ceil(Number(fiat) * rate)
    setLocalAmount(String(amountInSats))
  }

  function syncFiatWithSats(sats: string) {
    const amountInFiat = Number(sats) / rate
    setLocalFiat(amountInFiat.toFixed(2))
  }

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

  // TODO: Refactor into custom hook
  const createInvoiceMutation = useMutation({
    mutationKey: ['createInvoice'],
    mutationFn: ({
      amount,
      inkey,
      memo
    }: {
      amount: number
      inkey: string
      memo?: string
    }) => lnbits.createInvoice(amount, inkey, memo),
    onSuccess: (response) => {
      if (!response) return
      setQrCodeValue(response.bolt11)
      setAddressCopyType('invoice')
      lnbits.subscribePaymentWs(response.payment_hash, () => {
        toast.success(`+${formatNumber(amount)} sats!`)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        queryClient.invalidateQueries({ queryKey: ['paginated-payments'] })
      })
    }
  })

  function handleConfirmAmount() {
    const satsAmount = Number(localAmount)
    const memo = comment ? comment : undefined
    if (satsAmount && satsAmount > 0) {
      setAmount(satsAmount)
      createInvoiceMutation.mutate({
        amount: satsAmount,
        inkey: currentWallet!.inkey,
        memo
      })
    } else {
      setAmount(0)
      setLocalAmount('0')
      resetToLightningAddress()
    }
    bottomSheetAmountRef.current?.close()
  }

  function handleConfirmComment() {
    const newComment = localComment.trim()
    setComment(newComment)
    bottomSheetCommentRef.current?.close()
    if (!amount)
      toast.info(t('addAmountToLightningInvoice'), { duration: 3000 })
    else {
      createInvoiceMutation.mutate({
        amount: amount,
        inkey: currentWallet!.inkey,
        memo: newComment ? newComment : undefined
      })
    }
  }

  function handleClearAmount() {
    setAmount(0)
    setLocalAmount('0')
    resetToLightningAddress()
    if (comment)
      toast.info(t('addAmountToLightningInvoice'), { duration: 3000 })
    bottomSheetAmountRef.current?.close()
  }

  function handleClearComment() {
    setComment('')
    setLocalComment('')
    if (!amount) resetToLightningAddress()
    bottomSheetCommentRef.current?.close()
  }

  function resetToLightningAddress() {
    setQrCodeValue(paylink!.lnurl)
    setAddressCopyType('address')
  }

  function resetToInitial() {
    setAmount(0)
    setComment('')
    setLocalAmount('0')
    setLocalComment('')
    if (defaultWallet) {
      resetToLightningAddress()
    } else {
      setAddressCopyType('invoice')
      setIsQrCodePlaceholder(true)
    }
  }

  useEffect(() => {
    resetToInitial()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentWallet || !paylink) return <Redirect href="/" />

  return (
    <MMainLayout withPaddingTop withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('receiveViaLightning')}
            </MText>
          ),
          headerLeft: () => (
            <MIconButton onPress={() => router.navigate('/')}>
              <Close />
            </MIconButton>
          ),
          headerRight: () => (
            <>
              {addressCopyType === 'invoice' && qrCodeValue && (
                <MFormLayout.Item center>
                  <MTimer initial={EXPIRATION_TIME} key={qrCodeValue} />
                </MFormLayout.Item>
              )}
            </>
          )
        }}
      />
      <MVStack itemsCenter>
        <MFormLayout style={{ gap: 16 }}>
          <MFormLayout.Item center>
            <MFormLayout.Label
              label={
                addressCopyType === 'address'
                  ? t('lightningUrl')
                  : t('lightningInvoice')
              }
              center
            />
            <MQRCode
              value={qrCodeValue}
              loading={createInvoiceMutation.isPending}
              placeholder={isQrCodePlaceholder}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label
              label={
                addressCopyType === 'address'
                  ? t('lightningAddress')
                  : t('lightningInvoice')
              }
            />
            <MAddressCopy
              address={
                addressCopyType === 'address'
                  ? getPaylinkAddress(paylink.username)
                  : qrCodeValue
              }
              noFormat={addressCopyType === 'address'}
              placeholder={t('invoiceWillShowHere')}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('amount')} />
            <MEmptyInputButton
              placeholder={t('specifyAnAmount')}
              showPlaceholder={!amount}
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
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label label={t('comment')} />
            <MEmptyInputButton
              placeholder={t('commentDescription')}
              showPlaceholder={!comment}
              iconRight={<Pencil />}
              onPress={handleBottomSheetNoteOpen}
            >
              <MText>{comment}</MText>
            </MEmptyInputButton>
          </MFormLayout.Item>
        </MFormLayout>
        <MButton text={t('done')} onPress={() => router.navigate('/')} />
      </MVStack>
      <MBottomSheet
        ref={bottomSheetAmountRef}
        snapPoints={['72%']}
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
              onChangeType={(type) => setAmountType(type)}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MNumPad type={bitcoinUnit} onKeyPress={handleOnKeyPress} />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton
              text={t('confirmAmount')}
              loading={createInvoiceMutation.isPending}
              onPress={handleConfirmAmount}
            />
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
      <MBottomSheet
        ref={bottomSheetCommentRef}
        title={t('commentDescription')}
        snapPoints={['55%']}
        onClose={() => Keyboard.dismiss()}
      >
        <MFormLayout style={{ gap: 16 }}>
          <MFormLayout.Item>
            <MTextInput
              ref={sheetCommentRef}
              value={localComment}
              placeholder={t('commentDescription')}
              onChangeText={setLocalComment}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton
              text={t('save')}
              loading={createInvoiceMutation.isPending}
              onPress={handleConfirmComment}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton
              variant="ghost"
              text={t('clearComment')}
              onPress={handleClearComment}
            />
          </MFormLayout.Item>
        </MFormLayout>
      </MBottomSheet>
    </MMainLayout>
  )
}
