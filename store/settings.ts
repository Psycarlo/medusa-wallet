import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { BASE_URL as LNBITS_DEFAULT_URL } from '@/api/lnbits'
import type { SupportedBitcoinUnits } from '@/config/bitcoin'
import type { SupportedFiatCurrencies } from '@/config/fiat'
import type { SupportedLanguages } from '@/config/language'
import { changeLocale, i18n } from '@/locales'
import mmkvStorage from '@/storage/mmkv'

type SettingsState = {
  language: SupportedLanguages
  bitcoinUnit: SupportedBitcoinUnits
  fiatCurrency: SupportedFiatCurrencies
  pinEnabled: boolean
  biometricEnabled: boolean
  lnbitsUrl: string
  displayLowValuePercentage: boolean
}

type SettingsActions = {
  setLanguage: (language: SettingsState['language']) => void
  setBitcoinUnit: (bitcoinUnit: SettingsState['bitcoinUnit']) => void
  setFiatCurrency: (fiatCurrency: SettingsState['fiatCurrency']) => void
  setPinEnabled: (pinEnabled: SettingsState['pinEnabled']) => void
  setBiometricEnabled: (
    biometricEnabled: SettingsState['biometricEnabled']
  ) => void
  setLnbitsUrl: (lnbitsUrl: SettingsState['lnbitsUrl']) => void
  setDisplayLowValuePercentage: (
    displayLowValuePercentage: SettingsState['displayLowValuePercentage']
  ) => void
}

const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: i18n.locale as SupportedLanguages,
      bitcoinUnit: 'sats',
      fiatCurrency: 'usd',
      pinEnabled: false,
      biometricEnabled: false,
      lnbitsUrl: LNBITS_DEFAULT_URL,
      displayLowValuePercentage: false,
      setLanguage: (language) => {
        changeLocale(language)
        set({ language })
      },
      setBitcoinUnit: (bitcoinUnit) => {
        set({ bitcoinUnit })
      },
      setFiatCurrency: (fiatCurrency) => {
        set({ fiatCurrency })
      },
      setPinEnabled: (pinEnabled) => {
        set({ pinEnabled })
      },
      setBiometricEnabled: (biometricEnabled) => {
        set({ biometricEnabled })
      },
      setLnbitsUrl: (lnbitsUrl) => {
        set({ lnbitsUrl })
      },
      setDisplayLowValuePercentage: (displayLowValuePercentage) => {
        set({ displayLowValuePercentage })
      }
    }),
    {
      name: 'medusa-settings',
      storage: createJSONStorage(() => mmkvStorage)
    }
  )
)

export { useSettingsStore }
