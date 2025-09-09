import {
  formatAddress,
  formatDate,
  formatNumber,
  formatTime,
  formatTimer
} from '@/utils/format'

describe('format utils', () => {
  describe('formatAddress', () => {
    it('should return an address with 16 or less characters', () => {
      expect(formatAddress('hi@medusa.bz')).toBe('hi@medusa.bz')
    })

    it('should return first and last eight characters of the address', () => {
      expect(formatAddress('1111111111111111111114oLvT2')).toBe(
        '11111111...114oLvT2'
      )
    })
  })

  describe('formatNumber', () => {
    it('should return the correct localized number with no decimals', () => {
      expect(formatNumber(3000)).toBe('3,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should return the correct localized number with decimals', () => {
      expect(formatNumber(0.795, 2)).toBe('0.80')
    })
  })

  describe('formatTime', () => {
    it('should return the correct formatted time', () => {
      expect(formatTime(new Date(1231006505000))).toBe('6:15pm')
    })
  })

  describe('formatDate', () => {
    it('should return the correct formatted date', () => {
      expect(formatDate(new Date(1231006505000))).toBe('Jan 3, 2009')
    })

    it('should work with string date', () => {
      expect(formatDate('2024-03-28T11:51:36.000Z')).toBe('Mar 28, 2024')
    })

    it('should work with number date', () => {
      expect(formatDate(1711639918000)).toBe('Mar 28, 2024')
    })
  })

  describe('formatTimer', () => {
    it('should return the correct formatted timer', () => {
      expect(formatTimer(1)).toBe('00:00:01')
      expect(formatTimer(61)).toBe('00:01:01')
      expect(formatTimer(3601)).toBe('01:00:01')
      expect(formatTimer(6 * 60 * 60)).toBe('06:00:00')
    })
  })
})
