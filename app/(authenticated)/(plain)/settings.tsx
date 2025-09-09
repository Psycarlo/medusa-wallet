import type BottomSheet from '@gorhom/bottom-sheet'
import * as Linking from 'expo-linking'
import { Stack, useRouter } from 'expo-router'
import { useRef } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { useShallow } from 'zustand/react/shallow'

import ArrowLeftRight from '@/components/icons/ArrowLeftRight'
import ExternalLink from '@/components/icons/ExternalLink'
import Logout from '@/components/icons/Logout'
import Pencil from '@/components/icons/Pencil'
import MButton from '@/components/MButton'
import MIconButton from '@/components/MIconButton'
import MSettingsCard from '@/components/MSettingsCard'
import MSwitch from '@/components/MSwitch'
import MText from '@/components/MText'
import BitcoinUnit from '@/components/sheets/BitcoinUnit'
import FiatCurrency from '@/components/sheets/FiatCurrency'
import Language from '@/components/sheets/Language'
import LnbitsUrl from '@/components/sheets/LnbitsUrl'
import { bitcoinUnitDictionary } from '@/config/bitcoin'
import { ISSUES_LINK } from '@/config/github'
import { APP_VERSION, BUILD_NUMBER } from '@/constants/version'
import useBiometric from '@/hooks/useBiometric'
import useLogout from '@/hooks/useLogout'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'
import { Colors } from '@/styles'
import fiat from '@/utils/fiat'
import languageUtils from '@/utils/language'
import { getPaylinkAddress } from '@/utils/medusa'

// To enable BIOMETRIC, user needs to have pin enabled
// If PIN is enabled, BIOMETRIC can be disabled without confirmation
// Enabling BIOMETRIC requires entering the current PIN.
// Disabling PIN while BIOMETRIC is enabled, requires BIOMETRIC confirmation
// Changing PIN while BIOMETRIC is enabled, requires BIOMETRIC confirmation
// Changing PIN when BIOMETRIC is disabled, requires current PIN confirmation
// Enabling PIN also enables BIOMETRIC (if available)

export default function Settings() {
  const router = useRouter()
  const [username, email] = useAuthStore(
    useShallow((state) => [state.username, state.email])
  )
  const paylinkUsername = useWalletsStore((state) => state.paylink?.username)

  const [
    language,
    bitcoinUnit,
    fiatCurrency,
    pinEnabled,
    biometricEnabled,
    lnbitsUrl,
    displayLowValuePercentage,
    setPinEnabled,
    setBiometricEnabled,
    setDisplayLowValuePercentage
  ] = useSettingsStore(
    useShallow((state) => [
      state.language,
      state.bitcoinUnit,
      state.fiatCurrency,
      state.pinEnabled,
      state.biometricEnabled,
      state.lnbitsUrl,
      state.displayLowValuePercentage,
      state.setPinEnabled,
      state.setBiometricEnabled,
      state.setDisplayLowValuePercentage
    ])
  )
  const logout = useLogout()
  const { hasBiometric, biometricAuth } = useBiometric()

  const bottomSheetLnbitsUrlRef = useRef<BottomSheet>(null)
  const bottomSheetLanguageRef = useRef<BottomSheet>(null)
  const bottomSheetBitcoinUnitRef = useRef<BottomSheet>(null)
  const bottomSheetFiatCurrencyRef = useRef<BottomSheet>(null)

  const handleBottomSheetLnbitsUrlOpen = () =>
    bottomSheetLnbitsUrlRef.current?.expand()
  const handleBottomSheetLanguageOpen = () =>
    bottomSheetLanguageRef.current?.expand()
  const handleBottomSheetBitcoinUnitOpen = () =>
    bottomSheetBitcoinUnitRef.current?.expand()
  const handleBottomSheetFiatCurrencyOpen = () =>
    bottomSheetFiatCurrencyRef.current?.expand()

  async function handleTogglePin() {
    if (!pinEnabled) router.navigate('/newPin')
    else if (pinEnabled && hasBiometric && biometricEnabled) {
      const biometricAuthSuccess = await biometricAuth()
      if (biometricAuthSuccess) {
        setPinEnabled(false)
        setBiometricEnabled(false)
      }
    } else if (pinEnabled && (!hasBiometric || !biometricEnabled))
      router.push({ pathname: '/validatePin', params: { type: 'disable-pin' } })
  }

  function handleToggleBiometric() {
    if (biometricEnabled) setBiometricEnabled(false)
    else
      router.push({
        pathname: '/validatePin',
        params: { type: 'enable-biometric' }
      })
  }

  async function handleChangePin() {
    if (!pinEnabled) return

    if (!hasBiometric || !biometricEnabled)
      router.push({ pathname: '/validatePin', params: { type: 'change-pin' } })
    else if (hasBiometric && biometricEnabled) {
      const biometricAuthSuccess = await biometricAuth()
      if (biometricAuthSuccess)
        router.push({
          pathname: '/validatePin',
          params: { type: 'change-pin' }
        })
    }
  }

  return (
    <>
      <MMainLayout withPaddingBottom>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <MText size="lg" weight="bold">
                {t('settings')}
              </MText>
            )
          }}
        />
        <ScrollView>
          <MVStack gap="md">
            <MSettingsCard title={t('account')}>
              <MSettingsCard.Item>
                <MSettingsCard.Label
                  title={t('yourUsername')}
                  value={username || t('noUsername')}
                  muted={!username}
                />
              </MSettingsCard.Item>
              <MSettingsCard.Item>
                <MSettingsCard.Label
                  title={t('yourEmail')}
                  value={email || t('noEmail')}
                  muted={!email}
                />
              </MSettingsCard.Item>
              {paylinkUsername && (
                <MSettingsCard.Item>
                  <MSettingsCard.Label
                    title={t('yourLightningAddress')}
                    value={getPaylinkAddress(paylinkUsername)}
                  />
                </MSettingsCard.Item>
              )}
              <MSettingsCard.Item onPress={handleBottomSheetLnbitsUrlOpen}>
                <MSettingsCard.Label title={t('lnbitsUrl')} value={lnbitsUrl} />
                <MIconButton onPress={handleBottomSheetLnbitsUrlOpen}>
                  <Pencil stroke={Colors.white} />
                </MIconButton>
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('display')}>
              <MSettingsCard.Item
                onPress={() =>
                  setDisplayLowValuePercentage(!displayLowValuePercentage)
                }
              >
                <MSettingsCard.Label
                  title={t('displayLowValuePercentage')}
                  value={
                    displayLowValuePercentage
                      ? t('activated').toLowerCase()
                      : t('deactivated').toLowerCase()
                  }
                />
                <MSwitch
                  value={displayLowValuePercentage}
                  onTouchStart={() =>
                    setDisplayLowValuePercentage(!displayLowValuePercentage)
                  }
                />
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('security')}>
              <MSettingsCard.Item onPress={handleTogglePin}>
                <MSettingsCard.Label
                  title={t('appPin')}
                  value={
                    pinEnabled
                      ? t('activated').toLowerCase()
                      : t('deactivated').toLowerCase()
                  }
                />
                <MSwitch value={pinEnabled} onTouchStart={handleTogglePin} />
              </MSettingsCard.Item>
              {pinEnabled && hasBiometric && (
                <MSettingsCard.Item onPress={handleToggleBiometric}>
                  <MSettingsCard.Label
                    title={t('biometric')}
                    value={
                      biometricEnabled
                        ? t('activated').toLowerCase()
                        : t('deactivated').toLowerCase()
                    }
                  />
                  <MSwitch
                    value={biometricEnabled}
                    onTouchStart={handleToggleBiometric}
                  />
                </MSettingsCard.Item>
              )}
              {pinEnabled && (
                <MSettingsCard.Item reverse>
                  <MSettingsCard.Label title="" value="" />
                  <MButton
                    text={t('changePin')}
                    textSize="small"
                    variant="muted"
                    onPress={handleChangePin}
                  />
                </MSettingsCard.Item>
              )}
            </MSettingsCard>
            <MSettingsCard title={t('language')}>
              <MSettingsCard.Item onPress={handleBottomSheetLanguageOpen}>
                <MSettingsCard.Label
                  title={t('appLanguage')}
                  value={languageUtils.getName(language).toLowerCase()}
                />
                <MIconButton onPress={handleBottomSheetLanguageOpen}>
                  <ArrowLeftRight />
                </MIconButton>
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('currency')}>
              <MSettingsCard.Item onPress={handleBottomSheetBitcoinUnitOpen}>
                <MSettingsCard.Label
                  title={t('bitcoinUnit')}
                  value={bitcoinUnitDictionary[bitcoinUnit].toLowerCase()}
                />
                <MIconButton onPress={handleBottomSheetBitcoinUnitOpen}>
                  <ArrowLeftRight />
                </MIconButton>
              </MSettingsCard.Item>
              <MSettingsCard.Item onPress={handleBottomSheetFiatCurrencyOpen}>
                <MSettingsCard.Label
                  title={t('fiatCurrency')}
                  value={`${fiat.getName(fiatCurrency).toLowerCase()} ${fiat.getSymbol(fiatCurrency)}`}
                />
                <MIconButton onPress={handleBottomSheetFiatCurrencyOpen}>
                  <ArrowLeftRight />
                </MIconButton>
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('bugs')}>
              <MSettingsCard.Item onPress={() => Linking.openURL(ISSUES_LINK)}>
                <MSettingsCard.Label
                  title={t('reportBug')}
                  value={t('helpImproveTheApp').toLowerCase()}
                />
                <MIconButton onPress={() => Linking.openURL(ISSUES_LINK)}>
                  <ExternalLink />
                </MIconButton>
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('version')}>
              <MSettingsCard.Item>
                <MSettingsCard.Label
                  title={t('appVersion')}
                  value={`${APP_VERSION} (${BUILD_NUMBER})`}
                />
              </MSettingsCard.Item>
            </MSettingsCard>
            <MSettingsCard title={t('authentication')}>
              <MSettingsCard.Item onPress={logout}>
                <MSettingsCard.Label
                  title={t('seeYouLater')}
                  value={t('clickToLogout').toLowerCase()}
                />
                <MIconButton onPress={logout}>
                  <Logout />
                </MIconButton>
              </MSettingsCard.Item>
            </MSettingsCard>
          </MVStack>
        </ScrollView>
      </MMainLayout>
      <LnbitsUrl ref={bottomSheetLnbitsUrlRef} />
      <Language ref={bottomSheetLanguageRef} />
      <BitcoinUnit ref={bottomSheetBitcoinUnitRef} />
      <FiatCurrency ref={bottomSheetFiatCurrencyRef} />
    </>
  )
}
