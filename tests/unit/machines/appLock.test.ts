import {
  appLockTransition,
  isBiometricEnabled,
  isPinEnabled,
  migrateLegacyAppLock
} from '@/machines/appLock'

describe('app lock machine', () => {
  describe('appLockTransition', () => {
    it('should enable biometric together with a new pin', () => {
      expect(appLockTransition('none', 'PIN_SET')).toBe('pinAndBiometric')
    })

    it('should keep the method when the pin changes', () => {
      expect(appLockTransition('pin', 'PIN_SET')).toBe('pin')
      expect(appLockTransition('pinAndBiometric', 'PIN_SET')).toBe(
        'pinAndBiometric'
      )
    })

    it('should toggle biometric while the pin is enabled', () => {
      expect(appLockTransition('pin', 'BIOMETRIC_ENABLED')).toBe(
        'pinAndBiometric'
      )
      expect(appLockTransition('pinAndBiometric', 'BIOMETRIC_DISABLED')).toBe(
        'pin'
      )
    })

    it('should remove biometric together with the pin', () => {
      expect(appLockTransition('pin', 'PIN_REMOVED')).toBe('none')
      expect(appLockTransition('pinAndBiometric', 'PIN_REMOVED')).toBe('none')
    })

    it('should never enable biometric without a pin', () => {
      expect(appLockTransition('none', 'BIOMETRIC_ENABLED')).toBe('none')
      expect(appLockTransition('none', 'BIOMETRIC_DISABLED')).toBe('none')
      expect(appLockTransition('none', 'PIN_REMOVED')).toBe('none')
    })
  })

  describe('selectors', () => {
    it('should tell which methods are enabled', () => {
      expect(isPinEnabled('none')).toBe(false)
      expect(isPinEnabled('pin')).toBe(true)
      expect(isPinEnabled('pinAndBiometric')).toBe(true)

      expect(isBiometricEnabled('none')).toBe(false)
      expect(isBiometricEnabled('pin')).toBe(false)
      expect(isBiometricEnabled('pinAndBiometric')).toBe(true)
    })
  })

  describe('migrateLegacyAppLock', () => {
    it('should map the legacy flags to a method', () => {
      expect(migrateLegacyAppLock({})).toBe('none')
      expect(
        migrateLegacyAppLock({ pinEnabled: false, biometricEnabled: false })
      ).toBe('none')
      expect(
        migrateLegacyAppLock({ pinEnabled: true, biometricEnabled: false })
      ).toBe('pin')
      expect(
        migrateLegacyAppLock({ pinEnabled: true, biometricEnabled: true })
      ).toBe('pinAndBiometric')
    })

    it('should drop biometric without a pin', () => {
      expect(
        migrateLegacyAppLock({ pinEnabled: false, biometricEnabled: true })
      ).toBe('none')
    })
  })
})
