import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { SupportedBitcoinUnits } from '@/config/bitcoin'
import type { SupportedFiatCurrencies } from '@/config/fiat'
import type { SupportedLanguages } from '@/config/language'
import { LNBITS_DEFAULT_URL } from '@/config/lnbits'
import { changeLocale, i18n } from '@/locales'
import {
  type AppLockEvent,
  type AppLockMethod,
  appLockTransition,
  type LegacyAppLockFlags,
  migrateLegacyAppLock
} from '@/machines/appLock'
import { mmkvStorage } from '@/storage/mmkv'

type SettingsState = {
  language: SupportedLanguages
  bitcoinUnit: SupportedBitcoinUnits
  fiatCurrency: SupportedFiatCurrencies
  /** See `machines/appLock.ts` for the allowed transitions */
  appLock: AppLockMethod
  lnbitsUrl: string
  displayLowValuePercentage: boolean
}

type SettingsActions = {
  setLanguage: (language: SettingsState['language']) => void
  setBitcoinUnit: (bitcoinUnit: SettingsState['bitcoinUnit']) => void
  setFiatCurrency: (fiatCurrency: SettingsState['fiatCurrency']) => void
  updateAppLock: (event: AppLockEvent) => void
  setLnbitsUrl: (lnbitsUrl: SettingsState['lnbitsUrl']) => void
  setDisplayLowValuePercentage: (
    displayLowValuePercentage: SettingsState['displayLowValuePercentage']
  ) => void
}

/** v0 stored the app lock method as `pinEnabled` and `biometricEnabled` */
function migrateSettingsState(persistedState: unknown, version: number) {
  if (version >= 1) return persistedState as SettingsState

  const { pinEnabled, biometricEnabled, ...state } = (persistedState ??
    {}) as Partial<SettingsState> & LegacyAppLockFlags

  return {
    ...state,
    appLock: migrateLegacyAppLock({ pinEnabled, biometricEnabled })
  } as SettingsState
}

const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      language: i18n.locale as SupportedLanguages,
      bitcoinUnit: 'sats',
      fiatCurrency: 'usd',
      appLock: 'none',
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
      updateAppLock: (event) => {
        set({ appLock: appLockTransition(get().appLock, event) })
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
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      migrate: migrateSettingsState,
      // i18n starts in English: apply the saved language on startup
      onRehydrateStorage: () => (state) => {
        if (state) changeLocale(state.language)
      }
    }
  )
)

export { migrateSettingsState, useSettingsStore }
