import type BottomSheet from '@gorhom/bottom-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useReducer, useRef, useState } from 'react'
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
import useAmountInput from '@/hooks/useAmountInput'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import {
  getReceiveRequest,
  initialReceiveState,
  receiveReducer
} from '@/machines/receive'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { type ReceiveSearchParams } from '@/types/searchParams'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import { getInvoiceExpiry } from '@/utils/invoice'
import { getPaylinkAddress } from '@/utils/medusa'
import { getDefaultWallet, isDefaultWallet } from '@/utils/wallet'

// If no walletId is provided, the default wallet will be used
// If is the default wallet, we display the paylink lnurl
// If is not the default wallet, or the account has no paylink (e.g. created
// outside Medusa), an amount is needed to display a bolt11
// If is the default wallet and user wants to add amount, we display
// bolt11 with that amount (and label if provided)
// A paid or expired bolt11 is replaced by the above (see machines/receive.ts)

export default function Receive() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { walletId } = useLocalSearchParams<ReceiveSearchParams>()
  const [wallets, paylink] = useWalletsStore(
    useShallow((state) => [state.wallets, state.paylink])
  )
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit, lnbitsUrl] = useSettingsStore(
    useShallow((state) => [
      state.fiatCurrency,
      state.bitcoinUnit,
      state.lnbitsUrl
    ])
  )
  const defaultWallet = walletId ? isDefaultWallet(walletId, wallets) : true

  const currentWallet = walletId
    ? wallets.find((wallet) => wallet.id === walletId)
    : getDefaultWallet(wallets)

  const [state, dispatch] = useReducer(receiveReducer, initialReceiveState)
  const { amount, comment } = state
  // Only the default wallet owns the paylink (lightning address)
  const request = getReceiveRequest(
    state,
    defaultWallet ? paylink?.lnurl : undefined
  )
  const isInvoice = request.type !== 'address'
  const qrCodeValue =
    request.type === 'invoice'
      ? request.bolt11
      : request.type === 'address'
        ? request.lnurl
        : ''

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
        paymentWsRef.current?.close()
        // createInvoice returns undefined on failure: drop the old invoice
        if (!response) {
          dispatch({ type: 'INVOICE_FAILED' })
          amountInput.reset()
          toast.error(t('errorCreateInvoice'))
          return
        }
        const { bolt11 } = response
        dispatch({
          type: 'INVOICE_CREATED',
          invoice: {
            bolt11,
            // One second earlier, to never show an invoice that just expired
            expiresAt: Date.now() + (getInvoiceExpiry(bolt11) - 1) * 1000
          }
        })
        paymentWsRef.current = lnbits.subscribePaymentWs(
          response.payment_hash,
          () => {
            toast.success(`+${formatNumber(variables.amount)} sats!`)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            // A paid invoice can't be paid again
            settleInvoice(bolt11)
          }
        )
      }
    })
  }

  function settleInvoice(bolt11: string) {
    dispatch({ type: 'INVOICE_SETTLED', bolt11 })
    amountInput.reset()
  }

  function handleInvoiceExpired(bolt11: string) {
    paymentWsRef.current?.close()
    settleInvoice(bolt11)
    toast.info(t('invoiceExpired'), { duration: 3000 })
  }

  // Drops the invoice, including one that is still being created
  function clearAmount() {
    createInvoiceMutation.reset()
    paymentWsRef.current?.close()
    dispatch({ type: 'AMOUNT_CLEARED' })
    amountInput.reset()
  }

  function handleConfirmAmount() {
    const satsAmount = amountInput.sats
    const memo = comment ? comment : undefined
    if (currentWallet && satsAmount > 0) {
      dispatch({ type: 'AMOUNT_SET', amount: satsAmount })
      createInvoice({
        amount: satsAmount,
        inkey: currentWallet.inkey,
        memo
      })
    } else clearAmount()
    bottomSheetAmountRef.current?.close()
  }

  function handleConfirmComment() {
    const newComment = localComment.trim()
    dispatch({ type: 'COMMENT_SET', comment: newComment })
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
    clearAmount()
    if (comment)
      toast.info(t('addAmountToLightningInvoice'), { duration: 3000 })
    bottomSheetAmountRef.current?.close()
  }

  function handleClearComment() {
    dispatch({ type: 'COMMENT_SET', comment: '' })
    setLocalComment('')
    bottomSheetCommentRef.current?.close()
  }

  if (!currentWallet) return <Redirect href="/" />

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
              {request.type === 'invoice' && (
                <MFormLayout.Item center>
                  <MTimer
                    key={request.bolt11}
                    expiresAt={request.expiresAt}
                    onExpire={() => handleInvoiceExpired(request.bolt11)}
                  />
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
              label={isInvoice ? t('lightningInvoice') : t('lightningUrl')}
              center
            />
            <MQRCode
              value={qrCodeValue}
              loading={createInvoiceMutation.isPending}
              placeholder={request.type === 'empty'}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MFormLayout.Label
              label={isInvoice ? t('lightningInvoice') : t('lightningAddress')}
            />
            <MAddressCopy
              address={
                request.type === 'address' && paylink
                  ? getPaylinkAddress(paylink.username, lnbitsUrl)
                  : qrCodeValue
              }
              noFormat={!isInvoice}
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
