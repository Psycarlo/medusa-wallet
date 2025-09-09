import medusa from '@/api/medusa'

describe('medusa api', () => {
  describe('getPricesAt', () => {
    it('should return correct fiat bitcoin prices', async () => {
      const fiatBitcoinPrices = await medusa.getBitcoinPricesAt(1736446030)

      expect(fiatBitcoinPrices.usd).toBe(92690.55)
      expect(fiatBitcoinPrices.eur).toBe(90020.51)
      expect(fiatBitcoinPrices.gbp).toBe(75365.11)
      expect(fiatBitcoinPrices.ron).toBe(447676.84)
    })

    it('should return correct fiat values', async () => {
      const fiatValues = await medusa.getPricesAt(1000, 1736446030)

      expect(fiatValues.usd).toBe(0.93)
      expect(fiatValues.eur).toBe(0.9)
      expect(fiatValues.gbp).toBe(0.75)
      expect(fiatValues.ron).toBe(4.48)
    })
  })
})
