import number from '@/utils/number'

describe('number utils', () => {
  describe('getDecimalPlaces', () => {
    it('should return correct number of decimal places', () => {
      expect(number.getDecimalPlaces(Infinity)).toBe(0)
      expect(number.getDecimalPlaces(1)).toBe(0)
      expect(number.getDecimalPlaces(0.1)).toBe(1)
      expect(number.getDecimalPlaces(0.00009)).toBe(5)
      expect(number.getDecimalPlaces(0.000007)).toBe(6)
      expect(number.getDecimalPlaces(0.0000002)).toBe(7)
      expect(number.getDecimalPlaces(0.00000001)).toBe(8)
      expect(number.getDecimalPlaces(0.00000025)).toBe(8)
      expect(number.getDecimalPlaces(0.000024975)).toBe(8)
      expect(number.getDecimalPlaces(0.1 + 0.2)).toBe(1)
    })
  })

  describe('getPercentageChange', () => {
    it('should return correct percentage change', () => {
      expect(number.getPercentageChange(50, 100)).toBe(100)
      expect(number.getPercentageChange(100, 50)).toBe(-50)
      expect(number.getPercentageChange(0, 100)).toBe(0)
      expect(number.getPercentageChange(100, 104.1)).toBe(4.1)
      expect(number.getPercentageChange(0.93, 0.94)).toBe(1.08)
    })
  })
})
