import { getHistoricalPricesMap, getPaylinkAddress } from '@/utils/medusa'

describe('medusa utils', () => {
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

  describe('getPaylinkAddress', () => {
    it('should use the medusa domain for the default lnbits server', () => {
      expect(getPaylinkAddress('satoshi', 'https://wallet.medusa.bz')).toBe(
        'satoshi@medusa.bz'
      )
      expect(getPaylinkAddress('satoshi', 'https://wallet.medusa.bz/')).toBe(
        'satoshi@medusa.bz'
      )
    })

    it('should use the host of any other lnbits server', () => {
      expect(getPaylinkAddress('satoshi', 'https://lnbits.example.com/')).toBe(
        'satoshi@lnbits.example.com'
      )
    })
  })
})
