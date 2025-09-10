import version from '@/utils/version'

describe('version utils', () => {
  describe('gt', () => {
    it('should return correct boolean', () => {
      expect(version.gt('2.1.0', '1.0.0')).toBeTruthy()
      expect(version.gt('1.0.0', '1.0.0')).toBeFalsy()
      expect(version.gt('1.0.0', '2.1.2')).toBeFalsy()
      expect(version.gt('0.2.0', '0.1.0')).toBeTruthy()
      expect(version.gt('1.0.1', '0.2.0')).toBeTruthy()
      expect(version.gt('1.0.2', '0.2.1')).toBeTruthy()
    })
  })
})
