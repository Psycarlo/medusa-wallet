import type BottomSheet from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { TouchableHighlight } from 'react-native'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import Pencil from '@/components/icons/Pencil'
import MActivityIndicator from '@/components/MActivityIndicator'
import MAmountDisplay from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MNumPad from '@/components/MNumPad'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import usePay from '@/hooks/mutation/usePay'
import useAmountInput from '@/hooks/useAmountInput'
import MCenter from '@/layouts/MCenter'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useFiatStore } from '@/store/fiat'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import { type SendDetailsSearchParams } from '@/types/searchParams'
import fiatUtils from '@/utils/fiat'
import { formatAddress, formatNumber } from '@/utils/format'
import { decodeInvoice, normalizeInvoice } from '@/utils/invoice'
import { getDefaultWallet } from '@/utils/wallet'

type SendRequest =
  | {
      type: 'bolt11'
      invoice: string
      /** Amount in sats, 0 when the invoice has no amount */
      amount: number
      description: string
    }
  | {
      type: 'lnurl'
      callback: string
      recipient: string
      description: string
      /** Sendable range in sats */
      min: number
      max: number
      maxComment: number
    }

async function decodeSendRequest(invoice: string): Promise<SendRequest> {
  const decoded = await decodeInvoice(invoice)
  if (!decoded) throw new Error('Unable to decode invoice')

  if (decoded.type === 'bolt11') {
    const description = decoded.data.data.tags.find(
      (tag) => tag?.type === 'd'
    )?.value
    const amount = Number(decoded.data.human_readable_part.amount) / 1000 || 0

    return {
      type: 'bolt11',
      invoice: normalizeInvoice(invoice),
      amount,
      description: typeof description === 'string' ? description : ''
    }
  }

  const { metadata, callback, minSendable, maxSendable, commentAllowed } =
    decoded.data
  const identifier = metadata.find(([type]) => type === 'text/identifier')?.[1]
  const description = metadata.find(([type]) => type === 'text/plain')?.[1]

  return {
    type: 'lnurl',
    callback: callback || '',
    recipient: identifier || '?',
    description: description || '',
    min: Math.ceil((minSendable || 0) / 1000),
    max: Math.floor((maxSendable || 0) / 1000),
    maxComment: commentAllowed || 0
  }
}

export default function Send() {
  const router = useRouter()
  const { walletId, invoice } = useLocalSearchParams<SendDetailsSearchParams>()

  const wallet = useWalletsStore((state) => {
    const id = walletId || getDefaultWallet(state.wallets)?.id
    return state.wallets.find((wallet) => wallet.id === id)
  })
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )

  const {
    data: request,
    isPending: decoding,
    isError: decodeFailed
  } = useQuery({
    queryKey: ['decode-invoice', invoice],
    queryFn: () => decodeSendRequest(invoice),
    enabled: !!invoice,
    retry: false,
    gcTime: 0,
    // Decode once: refetching could fail and kick the user out mid-send
    staleTime: Infinity,
    refetchOnReconnect: false,
    networkMode: 'always'
  })

  const [lnurlAmount, setLnurlAmount] = useState<number>()
  const [comment, setComment] = useState('')
  const [localComment, setLocalComment] = useState('')

  const amountBottomSheetRef = useRef<BottomSheet>(null)
  const commentBottomSheetRef = useRef<BottomSheet>(null)

  const amountInput = useAmountInput(rate, bitcoinUnit)
  const payMutation = usePay(wallet?.adminkey ?? '')

  useEffect(() => {
    if (!decodeFailed) return
    toast.error(t('errorInvoiceDecode'))
    router.navigate('/')
  }, [decodeFailed, router])

  if (!wallet || !invoice) return <Redirect href="/" />
  if (decoding || !request)
    return (
      <MCenter>
        <MActivityIndicator />
      </MCenter>
    )

  const isLnurl = request.type === 'lnurl'
  // Fixed-amount LNURLs (min === max) don't need the user to pick an amount
  const amount = isLnurl
    ? (lnurlAmount ?? (request.min === request.max ? request.min : 0))
    : request.amount
  const insufficientFunds = amount > wallet.balance
  const outOfRange =
    isLnurl && amount > 0 && (amount < request.min || amount > request.max)
  const recipient = isLnurl ? request.recipient : formatAddress(request.invoice)

  function handlePay() {
    if (!request) return
    payMutation.mutate(
      request.type === 'bolt11'
        ? { type: 'bolt11', invoice: request.invoice }
        : {
            type: 'lnurl',
            callback: request.callback,
            amount,
            comment
          }
    )
  }

  function handleEditAmount() {
    if (!isLnurl) {
      toast.error(t('errorCantChangeAmount'))
      return
    }
    amountBottomSheetRef.current?.expand()
  }

  function handleOnPressMax() {
    if (!wallet) return
    const max =
      request?.type === 'lnurl'
        ? Math.min(wallet.balance, request.max)
        : wallet.balance
    amountInput.setSats(Math.floor(max))
  }

  function handleConfirmAmount() {
    setLnurlAmount(amountInput.sats)
    amountBottomSheetRef.current?.close()
  }

  function handleClearAmount() {
    amountInput.reset()
    setLnurlAmount(0)
  }

  function handleOnPressCommentSave() {
    setComment(localComment.trim())
    commentBottomSheetRef.current?.close()
  }

  return (
    <MMainLayout withPaddingTop withPaddingBottom>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('send')}
            </MText>
          )
        }}
      />
      <MVStack justifyBetween>
        <MVStack gap="xl">
          <TouchableHighlight
            underlayColor={Colors.grayDarkest}
            style={{ borderRadius: 8 }}
            onPress={handleEditAmount}
          >
            <MVStack gap="xs" itemsCenter>
              <MHStack gap="xs" style={{ alignItems: 'baseline' }}>
                <MText size="2xl" weight="bold">
                  {formatNumber(amount)}
                </MText>
                <MText size="lg" color="muted" weight="bold">
                  {amount === 1 ? 'sat' : 'sats'}
                </MText>
              </MHStack>
              <MText>
                {fiatUtils.getSymbol(fiatCurrency)}
                {formatNumber(rate && amount / rate, 2)}
              </MText>
            </MVStack>
          </TouchableHighlight>
          <MVStack gap="md">
            <MVStack
              style={{
                backgroundColor: Colors.grayDarkest,
                borderRadius: 8,
                padding: 16
              }}
            >
              <MHStack justifyBetween>
                <MText color="muted">{t('walletBalance')}</MText>
                <MText
                  weight="medium"
                  color={insufficientFunds ? 'danger' : 'white'}
                >
                  {formatNumber(wallet.balance, 0, true)} sats
                </MText>
              </MHStack>
            </MVStack>
            <MVStack
              style={{
                backgroundColor: Colors.grayDarkest,
                borderRadius: 8
              }}
            >
              <MHStack justifyBetween style={{ padding: 16 }}>
                <MText color="muted">{t('description')}</MText>
                <MText
                  weight="medium"
                  color={request.description ? 'white' : 'muted'}
                  numberOfLines={2}
                  style={{ flexShrink: 1, textAlign: 'right' }}
                >
                  {request.description || t('noDescription')}
                </MText>
              </MHStack>
              <TouchableHighlight
                underlayColor={Colors.grayDarker}
                onPress={handleEditAmount}
                style={{ padding: 16 }}
              >
                <MVStack gap="xs">
                  <MHStack justifyBetween>
                    <MText color="muted">{t('recipientGets')}</MText>
                    <MHStack style={{ width: 'auto' }}>
                      <MText weight="medium">{formatNumber(amount)} sats</MText>
                      <MText color="muted" weight="medium">
                        {fiatUtils.getSymbol(fiatCurrency)}
                        {formatNumber(rate && amount / rate, 2)}
                      </MText>
                      {isLnurl && <Pencil />}
                    </MHStack>
                  </MHStack>
                  {isLnurl && (
                    <MText
                      size="sm"
                      color={outOfRange ? 'danger' : 'muted'}
                      style={{ textAlign: 'right' }}
                    >
                      {t('amountRange', {
                        min: formatNumber(request.min),
                        max: formatNumber(request.max)
                      })}
                    </MText>
                  )}
                </MVStack>
              </TouchableHighlight>
              <MHStack justifyBetween style={{ padding: 16 }}>
                <MText color="muted">{t('recipient')}</MText>
                <MText
                  weight="medium"
                  numberOfLines={1}
                  style={{ flexShrink: 1, textAlign: 'right' }}
                >
                  {recipient}
                </MText>
              </MHStack>
              {isLnurl && request.maxComment > 0 && (
                <TouchableHighlight
                  underlayColor={Colors.grayDarker}
                  onPress={() => commentBottomSheetRef.current?.expand()}
                  style={{ padding: 16 }}
                >
                  <MHStack justifyBetween>
                    <MText color="muted">{t('comment')}</MText>
                    <MHStack style={{ justifyContent: 'flex-end', flex: 1 }}>
                      <MText
                        weight="medium"
                        color={comment ? 'white' : 'muted'}
                        numberOfLines={1}
                        style={{ flexShrink: 1 }}
                      >
                        {comment || t('commentDescription')}
                      </MText>
                      <Pencil />
                    </MHStack>
                  </MHStack>
                </TouchableHighlight>
              )}
            </MVStack>
          </MVStack>
        </MVStack>
        <MHStack>
          <MButton
            text={t('cancel')}
            variant="muted"
            onPress={() => router.navigate('/')}
          />
          <MButton
            text={t('send')}
            disabled={insufficientFunds || outOfRange || amount <= 0}
            loading={payMutation.isPending}
            onPress={handlePay}
          />
        </MHStack>
      </MVStack>
      <MBottomSheet
        ref={amountBottomSheetRef}
        snapPoints={['72%']}
        title={t('amount')}
      >
        <MFormLayout style={{ gap: 16, flex: 1 }}>
          <MFormLayout.Item>
            <MAmountDisplay
              type={amountInput.amountType}
              sats={amountInput.sats}
              amountText={amountInput.amountText}
              fiat={amountInput.fiat}
              fiatCurrency={fiatCurrency}
              rate={rate}
              withMax
              onPressMax={handleOnPressMax}
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
      {isLnurl && (
        <MBottomSheet
          ref={commentBottomSheetRef}
          title={t('commentDescription')}
        >
          <MFormLayout style={{ gap: 12 }}>
            <MFormLayout.Item>
              <MTextInput
                inBottomSheet
                value={localComment}
                onChangeText={setLocalComment}
              />
              <MText center size="sm" color="muted">
                {t('commentAllowedCharacters', { chars: request.maxComment })}
              </MText>
            </MFormLayout.Item>
            <MFormLayout.Item>
              <MButton
                disabled={localComment.trim().length > request.maxComment}
                text={t('save')}
                onPress={handleOnPressCommentSave}
              />
            </MFormLayout.Item>
          </MFormLayout>
        </MBottomSheet>
      )}
    </MMainLayout>
  )
}
