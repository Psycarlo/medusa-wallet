import type BottomSheet from '@gorhom/bottom-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Keyboard, type TextInputInstance } from 'react-native'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import Close from '@/components/icons/Close'
import Pencil from '@/components/icons/Pencil'
import MAddressCopy from '@/components/MAddressCopy'
import MAmountDisplay from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MEmptyInputButton from '@/components/MEmptyInputButton'
import MIconButton from '@/components/MIconButton'
import MNumPad from '@/components/MNumPad'
import MQRCode from '@/components/MQRCode'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import MTimer from '@/components/MTimer'
import { EXPIRATION_TIME } from '@/config/medusa'
import useAmountInput from '@/hooks/useAmountInput'
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

  // Default wallet shows the paylink (lightning address), others need an invoice
  const [addressCopyType, setAddressCopyType] = useState<'address' | 'invoice'>(
    defaultWallet ? 'address' : 'invoice'
  )
  const [qrCodeValue, setQrCodeValue] = useState(
    defaultWallet ? (paylink?.lnurl ?? '') : ''
  )
  const isQrCodePlaceholder = !defaultWallet

  const [amount, setAmount] = useState(0)
  const [comment, setComment] = useState('')

  const [localComment, setLocalComment] = useState('')

  const sheetCommentRef = useRef<TextInputInstance>(null)
  const bottomSheetAmountRef = useRef<BottomSheet>(null)
  const bottomSheetCommentRef = useRef<BottomSheet>(null)
  const paymentWsRef = useRef<WebSocket | null>(null)

  const amountInput = useAmountInput(rate, bitcoinUnit)

  // Stop listening for invoice payments when leaving the screen
  useEffect(() => () => paymentWsRef.current?.close(), [])

  function handleBottomSheetNoteOpen() {
    bottomSheetCommentRef.current?.expand()
    sheetCommentRef.current?.focus()
  }

  type CreateInvoiceVariables = {
    amount: number
    inkey: string
    memo?: string
  }

  const createInvoiceMutation = useMutation({
    mutationKey: ['createInvoice'],
    mutationFn: ({ amount, inkey, memo }: CreateInvoiceVariables) =>
      lnbits.createInvoice(amount, inkey, memo)
  })

  // Callbacks passed to `mutate` only run for the latest request and not
  // after the screen unmounts, so an outdated invoice never replaces a newer
  // one and no websocket is opened after leaving
  function createInvoice(variables: CreateInvoiceVariables) {
    createInvoiceMutation.mutate(variables, {
      onSuccess: (response) => {
        // createInvoice returns undefined on failure: drop the old invoice
        if (!response) {
          setAmount(0)
          amountInput.reset()
          resetQrCode()
          toast.error(t('errorCreateInvoice'))
          return
        }
        setQrCodeValue(response.bolt11)
        setAddressCopyType('invoice')
        paymentWsRef.current?.close()
        paymentWsRef.current = lnbits.subscribePaymentWs(
          response.payment_hash,
          () => {
            toast.success(`+${formatNumber(variables.amount)} sats!`)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
          }
        )
      }
    })
  }

  function handleConfirmAmount() {
    const satsAmount = amountInput.sats
    const memo = comment ? comment : undefined
    if (currentWallet && satsAmount > 0) {
      setAmount(satsAmount)
      createInvoice({
        amount: satsAmount,
        inkey: currentWallet.inkey,
        memo
      })
    } else {
      setAmount(0)
      amountInput.reset()
      resetQrCode()
    }
    bottomSheetAmountRef.current?.close()
  }

  function handleConfirmComment() {
    const newComment = localComment.trim()
    setComment(newComment)
    bottomSheetCommentRef.current?.close()
    if (!amount)
      toast.info(t('addAmountToLightningInvoice'), { duration: 3000 })
    else if (currentWallet) {
      createInvoice({
        amount,
        inkey: currentWallet.inkey,
        memo: newComment ? newComment : undefined
      })
    }
  }

  function handleClearAmount() {
    setAmount(0)
    amountInput.reset()
    resetQrCode()
    if (comment)
      toast.info(t('addAmountToLightningInvoice'), { duration: 3000 })
    bottomSheetAmountRef.current?.close()
  }

  function handleClearComment() {
    setComment('')
    setLocalComment('')
    if (!amount) resetQrCode()
    bottomSheetCommentRef.current?.close()
  }

  // Only the default wallet owns the paylink; other wallets need an invoice
  function resetQrCode() {
    paymentWsRef.current?.close()
    if (defaultWallet && paylink) {
      setQrCodeValue(paylink.lnurl)
      setAddressCopyType('address')
    } else {
      setQrCodeValue('')
      setAddressCopyType('invoice')
    }
  }

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
              inBottomSheet
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
