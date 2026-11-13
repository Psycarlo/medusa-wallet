import { i18n } from '@/locales'
import { migrateSettingsState, useSettingsStore } from '@/store/settings'

const mockStorage = new Map<string, string>()

jest.mock('@/storage/mmkv', () => ({
  mmkvStorage: {
    getItem: (name: string) => mockStorage.get(name) ?? null,
    setItem: (name: string, value: string) => {
      mockStorage.set(name, value)
    },
    removeItem: (name: string) => {
      mockStorage.delete(name)
    }
  }
}))

const initialState = useSettingsStore.getState()

describe('settings store', () => {
  beforeEach(() => {
    useSettingsStore.setState(initialState, true)
    mockStorage.clear()
    i18n.locale = 'en'
  })

  describe('app lock', () => {
    it('should start without a lock', () => {
      expect(useSettingsStore.getState().appLock).toBe('none')
    })

    it('should follow the app lock machine', () => {
      const { updateAppLock } = useSettingsStore.getState()

      updateAppLock('PIN_SET')
      expect(useSettingsStore.getState().appLock).toBe('pinAndBiometric')

      updateAppLock('BIOMETRIC_DISABLED')
      expect(useSettingsStore.getState().appLock).toBe('pin')

      updateAppLock('PIN_REMOVED')
      expect(useSettingsStore.getState().appLock).toBe('none')

      updateAppLock('BIOMETRIC_ENABLED')
      expect(useSettingsStore.getState().appLock).toBe('none')
    })
  })

  describe('persistence', () => {
    it('should restore settings stored by a previous version', async () => {
      mockStorage.set(
        'medusa-settings',
        JSON.stringify({
          version: 0,
          state: {
            language: 'pt',
            bitcoinUnit: 'btc',
            fiatCurrency: 'eur',
            pinEnabled: true,
            biometricEnabled: false,
            lnbitsUrl: 'https://example.com',
            displayLowValuePercentage: true
          }
        })
      )

      await useSettingsStore.persist.rehydrate()

      const state = useSettingsStore.getState()
      expect(state).toMatchObject({
        language: 'pt',
        bitcoinUnit: 'btc',
        fiatCurrency: 'eur',
        appLock: 'pin',
        lnbitsUrl: 'https://example.com',
        displayLowValuePercentage: true
      })
      expect(state).not.toHaveProperty('pinEnabled')
      expect(state).not.toHaveProperty('biometricEnabled')
      expect(i18n.locale).toBe('pt')

      const persisted = JSON.parse(mockStorage.get('medusa-settings')!) as {
        version: number
        state: Record<string, unknown>
      }
      expect(persisted.version).toBe(1)
      expect(persisted.state.appLock).toBe('pin')
      expect(persisted.state).not.toHaveProperty('pinEnabled')
    })
  })

  describe('migrateSettingsState', () => {
    it('should map the legacy flags to the app lock method', () => {
      expect(
        migrateSettingsState({ pinEnabled: true, biometricEnabled: true }, 0)
      ).toEqual({ appLock: 'pinAndBiometric' })
      expect(migrateSettingsState({}, 0)).toEqual({ appLock: 'none' })
      expect(migrateSettingsState(undefined, 0)).toEqual({ appLock: 'none' })
    })

    it('should keep already migrated settings', () => {
      const state = { appLock: 'pin' }
      expect(migrateSettingsState(state, 1)).toBe(state)
    })
  })
})
