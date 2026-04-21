import fiat from '@/utils/fiat'

describe('fiat utils', () => {
  describe('getName', () => {
    it('should return the correct currency name', () => {
      expect(fiat.getName('usd')).toBe('United States Dollar')
      expect(fiat.getName('eur')).toBe('Euro')
      expect(fiat.getName('brl')).toBe('Brazilian Real')
      expect(fiat.getName('jpy')).toBe('Japanese Yen')
    })
  })

  describe('getSymbol', () => {
    it('should return the correct currency symbol', () => {
      expect(fiat.getSymbol('usd')).toBe('$')
      expect(fiat.getSymbol('eur')).toBe('€')
      expect(fiat.getSymbol('gbp')).toBe('£')
      expect(fiat.getSymbol('brl')).toBe('R$')
      expect(fiat.getSymbol('jpy')).toBe('¥')
    })
  })
})
