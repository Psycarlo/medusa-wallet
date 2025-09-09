import { ADJECTIVES, MAX_NUMBER, NAMES } from '@/config/address'
import { generateRandomAddress } from '@/utils/random'

const numberArray = Array.from({ length: MAX_NUMBER }, (_, i) =>
  (i + 1).toString()
)

describe('random utils', () => {
  describe('generateRandomAddress', () => {
    it('should return random address', () => {
      const randomAddress = generateRandomAddress()

      expect(ADJECTIVES.some((s) => randomAddress.includes(s))).toBeTruthy()
      expect(NAMES.some((s) => randomAddress.includes(s))).toBeTruthy()
      expect(numberArray.some((s) => randomAddress.includes(s))).toBeTruthy()
    })
  })
})
