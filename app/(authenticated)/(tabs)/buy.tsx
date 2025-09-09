// import { StripeProvider, useStripe } from '@stripe/stripe-react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Stack, useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { TextInput } from 'react-native'
import { WebView } from 'react-native-webview'

import maxfy from '@/api/maxfy'
import medusa from '@/api/medusa'
import MActivityIndicator from '@/components/MActivityIndicator'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MSheetSelector from '@/components/MSheetSelector'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import MVoucher from '@/components/MVoucher'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import fiatUtils from '@/utils/fiat'
import { formatNumber } from '@/utils/format'
import { getPaylinkAddress } from '@/utils/medusa'
import validation from '@/utils/validation'

export default function Buy() {
  const email = useAuthStore((state) => state.email)
  const paylink = useWalletsStore((state) => state.paylink)
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  // const { initPaymentSheet, presentPaymentSheet } = useStripe() // TODO: Add this later

  const [selectedVoucher, setSelectedVoucher] = useState<number>()
  const [checkoutOpened, setCheckoutOpened] = useState(false)
  const [uri, setUri] = useState('')
  const [txid, setTxid] = useState('')
  const [stripePrice, setStripePrice] = useState('')
  const [customerEmail, setCustomerEmail] = useState(email)
  const [selectedEmailType, setSelectedEmailType] = useState<
    'default' | 'other'
  >('default')
  const [otherEmail, setOtherEmail] = useState('')

  const bottomSheetEmailRef = useRef<BottomSheet>(null)
  const otherEmailRef = useRef<TextInput>(null)

  const webviewRef = useRef<WebView>(null)

  const { data: btcPrice, isPending: isBtcPricePending } = useQuery({
    queryKey: ['bitcoinPrice'],
    queryFn: () => medusa.getBitcoinPricesAt(Date.now())
  })

  const { data: vouchers, isPending } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => maxfy.getVouchers()
  })

  const createTransactionMutation = useMutation({
    mutationKey: ['createTransaction'],
    mutationFn: (addressUsername: string) =>
      maxfy.createTransaction(
        getPaylinkAddress(addressUsername),
        customerEmail,
        selectedVoucher!
      ),
    onSuccess: async (data) => {
      setUri(data.checkout_url)
      setTxid(data.txid)
      setStripePrice(data.stripe_price)
      setCustomerEmail(data.customer_email)
      setCheckoutOpened(true)
    },
    onError: (error) => {
      // TODO: Handle error
      console.log('Error', error)
    }
  })

  useFocusEffect(
    useCallback(() => {
      setSelectedVoucher(undefined)
      setSelectedEmailType('default')
      setCustomerEmail(email)
      setOtherEmail('')
      setCheckoutOpened(false)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  )

  // const createCheckout = useMutation({
  //   mutationKey: ['createCheckout'],
  //   mutationFn: ({
  //     url,
  //     txid,
  //     stripePrice,
  //     customerEmail
  //   }: {
  //     url: string
  //     txid: string
  //     stripePrice: string
  //     customerEmail: string
  //   }) => maxfy.createCheckout(url, txid, stripePrice, customerEmail),
  //   onSuccess: (data) => {
  //     console.log('Data:', data)
  //     setHtml(data)
  //     setCheckoutOpened(true)
  //   }
  // })

  function handleOnSelectEmailType(id: string) {
    if (id === 'default') {
      setSelectedEmailType('default')
      setCustomerEmail(email)
      setOtherEmail('')
      bottomSheetEmailRef.current?.close()
    } else if (id === 'other') {
      setSelectedEmailType('other')
    }
  }

  // useEffect(() => {
  //   if (selectedEmailType === 'other') otherEmailRef.current?.focus()
  // }, [selectedEmailType])

  function handleOnCloseEmailBottomSheet(withClose?: boolean) {
    if (selectedEmailType === 'default') return

    const isValidEmail = validation.isValidEmail(otherEmail)

    if (selectedEmailType === 'other' && !isValidEmail) {
      setOtherEmail('')
      setSelectedEmailType('default')
      setCustomerEmail(email)
    } else if (selectedEmailType === 'other' && isValidEmail) {
      setCustomerEmail(otherEmail)
    }

    if (withClose) bottomSheetEmailRef.current?.close()
  }

  function handleCheckout() {
    if (!paylink) return
    createTransactionMutation.mutate(paylink.username)
  }

  const cookieScript = `
    document.cookie = "txid=${txid}; path=/";
    document.cookie = "stripe_price=${stripePrice}; path=/";
    document.cookie = "email=${customerEmail}; path=/";
    true;
  `

  return (
    <>
      <Stack.Screen options={{ headerLeft: undefined }} />
      <MMainLayout>
        {!checkoutOpened ? (
          <>
            <MVStack itemsCenter>
              <MVStack gap="none">
                <MText weight="bold" size="4xl" center>
                  {t('buyTitle1')}
                </MText>
                <MText color="bitcoin" weight="bold" size="4xl" center>
                  {t('buyTitle2')}
                </MText>
              </MVStack>
              <MVStack gap="none">
                <MText color="muted" center>
                  {t('buyDescription1')}
                </MText>
                <MText color="muted" center>
                  {t('buyDescription2')}
                </MText>
              </MVStack>
              <MHStack>
                <MText color="bitcoin" weight="bold" size="4xl">
                  BTC
                </MText>
                <MText weight="bold" size="4xl">
                  {btcPrice && !isBtcPricePending
                    ? `${fiatUtils.getSymbol(fiatCurrency)}${formatNumber(btcPrice[fiatCurrency], 2)}`
                    : '...'}
                </MText>
              </MHStack>
              <MText size="lg" weight="bold">
                {t('vouchers')}
              </MText>
              <MVStack>
                {!isPending &&
                  vouchers?.map((voucher) => (
                    <MVoucher
                      key={voucher.id}
                      amount={voucher.id}
                      fee={voucher.fee}
                      selected={voucher.id === selectedVoucher}
                      onPress={() => setSelectedVoucher(voucher.id)}
                    />
                  ))}
                {isPending && <MActivityIndicator />}
              </MVStack>
              <MButton
                text={t('continueToCheckout')}
                disabled={!selectedVoucher}
                loading={createTransactionMutation.isPending}
                onPress={() => handleCheckout()}
              />
              <MVStack gap="none">
                <MText color="muted" size="sm" center>
                  {t('wantUseAnotherEmail')}
                </MText>
                <MText
                  color="bitcoin"
                  size="sm"
                  weight="medium"
                  center
                  onPress={() => bottomSheetEmailRef.current?.expand()}
                >
                  {t('changeEmail')}
                </MText>
              </MVStack>
            </MVStack>
          </>
        ) : (
          <WebView
            ref={webviewRef}
            style={{ flex: 1 }}
            key={`${txid}:${stripePrice}:${selectedEmailType}:${customerEmail}`}
            source={{ uri }}
            injectedJavaScriptBeforeContentLoaded={cookieScript}
            originWhitelist={['*']}
            sharedCookiesEnabled={true}
          />
        )}
      </MMainLayout>
      <MBottomSheet
        snapPoints={['70%']}
        ref={bottomSheetEmailRef}
        title={t('selectCheckoutEmail')}
        onClose={() => handleOnCloseEmailBottomSheet()}
      >
        <MVStack>
          <MSheetSelector
            items={[
              { id: 'default', name: t('accountEmail'), info1: email },
              {
                id: 'other',
                name: t('otherEmail'),
                info1: t('clickOtherEmail')
              }
            ]}
            selectedId={selectedEmailType}
            withPaddingBottom={false}
            onSelect={handleOnSelectEmailType}
          />
          {selectedEmailType === 'other' && (
            <MTextInput
              ref={otherEmailRef}
              value={otherEmail}
              placeholder={t('otherEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setOtherEmail(text)}
              onEndEditing={() => handleOnCloseEmailBottomSheet(true)}
            />
          )}
        </MVStack>
      </MBottomSheet>
    </>
  )
}
