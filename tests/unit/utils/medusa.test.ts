import { getHistoricalPricesMap, getPaylinkAddress } from '@/utils/medusa'

describe('medusa utils', () => {
  describe('getPaylinkAddress', () => {
    it('should return the correct paylink address', () => {
      expect(getPaylinkAddress('satoshi')).toBe('satoshi@medusa.bz')
      expect(getPaylinkAddress('medusa')).toBe('medusa@medusa.bz')
    })
  })

  describe('getHistoricalPricesMap', () => {
    it('should return correct map', () => {
      const entries = [
        { id: '1', timestamp: 100 },
        { id: '2', timestamp: 150 },
        { id: '3', timestamp: 1000 },
        { id: '4', timestamp: 100 },
        { id: '5', timestamp: 901 }
      ]

      expect(getHistoricalPricesMap(entries)[100]).toEqual(['1', '2', '4'])
      expect(getHistoricalPricesMap(entries)[1000]).toEqual(['3', '5'])
    })
  })
})
