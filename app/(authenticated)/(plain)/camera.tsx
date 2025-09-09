import { BottomSheetModal } from '@gorhom/bottom-sheet'
import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions
} from 'expo-camera'
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'

import Close from '@/components/icons/Close'
import MBottomSheet from '@/components/MBottomSheet'
import MButton from '@/components/MButton'
import MCameraOverlay from '@/components/MCameraOverlay'
import MIconButton from '@/components/MIconButton'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import useHasInvoiceToPaste from '@/hooks/useHasInvoiceToPaste'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { type CameraSearchParams } from '@/types/searchParams'
import { LIGHTNING_ADDRESS_REGEX } from '@/utils/invoice'

export default function Camera() {
  const router = useRouter()
  const { walletId } = useLocalSearchParams<CameraSearchParams>()
  const [permission, requestPermission] = useCameraPermissions()
  const { hasInvoiceToPaste, invoiceValue } = useHasInvoiceToPaste()

  const scanLocked = useRef(false)
  const typeBottomSheetRef = useRef<BottomSheetModal>(null)

  const [lnaddress, setLnaddress] = useState('')

  function handleOnBarcodeScanned(scanResult: BarcodeScanningResult) {
    if (scanLocked.current) return
    scanLocked.current = true

    const invoice = scanResult.data

    router.push({
      pathname: `/send`,
      params: { walletId, invoice }
    })
  }

  function handleOnPaste() {
    if (!hasInvoiceToPaste) return

    router.push({
      pathname: `/send`,
      params: { walletId, invoice: invoiceValue }
    })
  }

  useFocusEffect(
    useCallback(() => {
      scanLocked.current = false
    }, [])
  )

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <MText size="lg" weight="bold">
              {t('scanQRCode')}
            </MText>
          ),
          headerLeft: () => (
            <MIconButton onPress={() => router.back()}>
              <Close />
            </MIconButton>
          )
        }}
      />
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleOnBarcodeScanned}
      />
      <MCameraOverlay active={permission?.granted} />
      <MMainLayout
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          paddingTop: 368,
          backgroundColor: 'transparent'
        }}
        withPaddingBottom
      >
        <MVStack justifyBetween>
          <MVStack itemsCenter>
            {permission?.granted ? (
              <MText center style={{ maxWidth: 235 }}>
                {t('scanText')}
              </MText>
            ) : (
              <>
                <MText center style={{ maxWidth: 235 }}>
                  {t('enableCameraText')}
                </MText>
                <MButton
                  text={t('enableCameraAccess')}
                  onPress={requestPermission}
                />
              </>
            )}
          </MVStack>
          <MHStack>
            <MButton
              text={t('type')}
              onPress={() => typeBottomSheetRef.current?.expand()}
            />
            <MButton
              text={t('paste')}
              disabled={!hasInvoiceToPaste}
              onPress={handleOnPaste}
            />
          </MHStack>
        </MVStack>
      </MMainLayout>
      <MBottomSheet
        ref={typeBottomSheetRef}
        title={t('enterLightningAddress')}
        onClose={() => Keyboard.dismiss()}
      >
        <MFormLayout>
          <MFormLayout.Item>
            <MTextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={lnaddress}
              onChangeText={(text) => setLnaddress(text)}
              placeholder="example@medusa.bz"
            />
          </MFormLayout.Item>
        </MFormLayout>
        <MButton
          text={t('confirm')}
          disabled={!LIGHTNING_ADDRESS_REGEX.test(lnaddress)}
          onPress={() =>
            router.push({
              pathname: '/send',
              params: { walletId, invoice: lnaddress }
            })
          }
        />
      </MBottomSheet>
    </View>
  )
}
