import BottomSheet from '@gorhom/bottom-sheet'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { TouchableHighlight } from 'react-native'
import { sha256 } from 'react-native-sha256'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import Pencil from '@/components/icons/Pencil'
import MActivityIndicator from '@/components/MActivityIndicator'
import MAmountDisplay, {
  type MAmountDisplayType
} from '@/components/MAmountDisplay'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MNumPad, { Keys } from '@/components/MNumPad'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import usePay from '@/hooks/mutation/usePay'
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
import { SendDetailsSearchParams } from '@/types/searchParams'
import fiatUtils from '@/utils/fiat'
import { formatAddress, formatNumber } from '@/utils/format'
import { decodeInvoice, normalizeInvoice } from '@/utils/invoice'
import { getDefaultWallet } from '@/utils/wallet'

export default function Send() {
  const router = useRouter()
  const { walletId, invoice } = useLocalSearchParams<SendDetailsSearchParams>()

  const wallets = useWalletsStore((state) => state.wallets)
  const defaultWallet = getDefaultWallet(wallets)
  const lookupId = walletId || defaultWallet?.id
  const wallet = useWalletsStore((state) =>
    state.wallets.find((wallet) => wallet.id === lookupId)
  )
  const rate = useFiatStore((state) => state.rate)
  const [fiatCurrency, bitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.bitcoinUnit])
  )

  const [decoding, setDecoding] = useState(true)
  const [recipient, setRecipient] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionHash, setDescriptionHash] = useState('')
  const [amount, setAmount] = useState(0)
  const [localAmount, setLocalAmount] = useState('0')
  const [localFiat, setLocalFiat] = useState('0')
  const [comment, setComment] = useState('')
  const [localComment, setLocalComment] = useState('')
  const [maxComment, setMaxComment] = useState(0)
  const [minSendable, setMinSendable] = useState(0)
  const [maxSendable, setMaxSendable] = useState(0)
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'bolt11' | 'wellknown'>()
  const [callback, setCallback] = useState('')

  const amountBottomSheetRef = useRef<BottomSheet>(null)
  const commentBottomSheetRef = useRef<BottomSheet>(null)

  const [amountType, setAmountType] = useState<MAmountDisplayType>('btc')

  const payMutation = usePay(wallet!.adminkey)

  function handlePay() {
    payMutation.mutate(
      invoiceType === 'bolt11'
        ? { type: 'bolt11', invoice: normalizeInvoice(invoice) }
        : {
            type: 'lnurl',
            callback,
            amount,
            comment,
            descriptionHash,
            description
          }
    )
  }

  async function handleDecodeInvoice(invoice: string) {
    setDecoding(true)
    const decodedInvoice = await decodeInvoice(invoice)

    if (!decodedInvoice) {
      setDecoding(false)
      toast.error(t('errorInvoiceDecode'))
      router.navigate('/')
      return
    }

    if (decodedInvoice.type === 'wellknown') {
      setInvoiceType('wellknown')

      const foundIdentifier = decodedInvoice.data.metadata.find(
        ([type]) => type === 'text/identifier'
      )?.[1]
      const foundDescription = decodedInvoice.data.metadata.find(
        ([type]) => type === 'text/plain'
      )?.[1]

      setRecipient(foundIdentifier || '?')
      setDescription(foundDescription || '?')
      const dHash = await sha256(foundDescription || '')
      setDescriptionHash(dHash)
      setMinSendable(decodedInvoice.data.minSendable || 0)
      setMaxSendable(decodedInvoice.data.maxSendable || 0)
      setMaxComment(decodedInvoice.data.commentAllowed || 0)
      setCallback(decodedInvoice.data.callback || '')
    } else if (decodedInvoice.type === 'bolt11') {
      setInvoiceType('bolt11')

      const foundDescription = decodedInvoice.data.data.tags.find(
        (tag) => tag?.type === 'd'
      )
      if (foundDescription && foundDescription.value)
        setDescription(foundDescription.value as string)

      const invoiceAmount =
        Number(decodedInvoice.data.human_readable_part.amount) / 1000
      setAmount(invoiceAmount)
      setRecipient(normalizeInvoice(invoice))
      if (invoiceAmount > wallet!.balance) setInsufficientFunds(true)
    }

    setDecoding(false)
  }

  function handleOnPressCommentSave() {
    setComment(localComment)
    commentBottomSheetRef.current?.close()
  }

  function handleEditAmount() {
    if (invoiceType === 'bolt11') {
      toast.error(t('errorCantChangeAmount'))
      return
    }

    amountBottomSheetRef.current?.expand()
  }

  function handleOnPressMax() {
    if (!wallet) return
    setLocalAmount(String(wallet.balance))
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

  function handleConfirmAmount() {
    const amount = Number(localAmount)
    setAmount(amount)

    setInsufficientFunds(amount > wallet!.balance)
    amountBottomSheetRef.current?.close()
  }

  function handleClearAmount() {
    setLocalAmount('0')
    setLocalFiat('0')
    setAmount(0)
    setInsufficientFunds(false)
  }

  useEffect(() => {
    if (!invoice) return

    handleDecodeInvoice(invoice)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!wallet || !invoice) return <Redirect href="/" />
  if (decoding)
    return (
      <MCenter>
        <MActivityIndicator />
      </MCenter>
    )

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
          <TouchableHighlight onPress={handleEditAmount}>
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
                <MText weight="medium" color={description ? 'white' : 'muted'}>
                  {description || t('noDescription')}
                </MText>
              </MHStack>
              <TouchableHighlight
                onPress={handleEditAmount}
                style={{ padding: 16 }}
              >
                <MHStack justifyBetween>
                  <MText color="muted">{t('recipientGets')}</MText>
                  <MHStack style={{ width: 'auto' }}>
                    <MText weight="medium">{formatNumber(amount)} sats</MText>
                    <MText color="muted" weight="medium">
                      {fiatUtils.getSymbol(fiatCurrency)}
                      {formatNumber(rate && amount / rate, 2)}
                    </MText>
                    {invoiceType === 'wellknown' && <Pencil />}
                  </MHStack>
                </MHStack>
              </TouchableHighlight>
              {/* <MHStack justifyBetween style={{ padding: 16 }}>
                <MText color="muted">{t('fee')}</MText>
                <MHStack style={{ width: 'auto' }}>
                  <MText weight="medium">~? sats</MText>
                  <MText color="muted" weight="medium">
                    (1%)
                  </MText>
                </MHStack>
              </MHStack> */}
              <MHStack justifyBetween style={{ padding: 16 }}>
                <MText color="muted">{t('recipient')}</MText>
                <MText weight="medium" style={{ textAlign: 'right' }}>
                  {invoiceType === 'wellknown'
                    ? recipient
                    : formatAddress(recipient)}
                </MText>
              </MHStack>
              {invoiceType === 'wellknown' && maxComment > 0 && (
                <TouchableHighlight
                  onPress={() => commentBottomSheetRef.current?.expand()}
                  style={{ padding: 16 }}
                >
                  <MHStack justifyBetween>
                    <MText color="muted">{t('comment')}</MText>
                    <MHStack style={{ justifyContent: 'flex-end', flex: 1 }}>
                      <MText
                        weight="medium"
                        color={comment ? 'white' : 'muted'}
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
            disabled={insufficientFunds || amount <= 0}
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
              type={amountType}
              sats={
                Number(localAmount) *
                (bitcoinUnit === 'btc' ? SATOSHIS_IN_BITCOIN : 1)
              }
              fiat={Number(localFiat)}
              fiatCurrency={fiatCurrency}
              rate={rate}
              withMax
              onPressMax={handleOnPressMax}
              onChangeType={(type) => setAmountType(type)}
            />
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MNumPad
              type={amountType === 'btc' ? bitcoinUnit : 'fiat'}
              onKeyPress={handleOnKeyPress}
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
      <MBottomSheet ref={commentBottomSheetRef} title={t('commentDescription')}>
        <MFormLayout style={{ gap: 12 }}>
          <MFormLayout.Item>
            <MTextInput onChangeText={(text) => setLocalComment(text)} />
            <MText center size="sm" color="muted">
              {t('commentAllowedCharacters', { chars: maxComment })}
            </MText>
          </MFormLayout.Item>
          <MFormLayout.Item>
            <MButton
              disabled={localComment.length > maxComment}
              text={t('save')}
              onPress={handleOnPressCommentSave}
            />
          </MFormLayout.Item>
        </MFormLayout>
      </MBottomSheet>
    </MMainLayout>
  )
}
