import { isSwapTimedOut } from '@/utils/swap'

describe('swap utils', () => {
  describe('isSwapTimedOut', () => {
    it('should time out pending swaps at their timeout block', () => {
      expect(isSwapTimedOut('pending', 900_000, 899_999)).toBe(false)
      expect(isSwapTimedOut('pending', 900_000, 900_000)).toBe(true)
      expect(isSwapTimedOut('pending', 900_000, 900_001)).toBe(true)
    })

    it('should not time out swaps that are no longer pending', () => {
      expect(isSwapTimedOut('complete', 900_000, 900_001)).toBe(false)
      expect(isSwapTimedOut('failed', 900_000, 900_001)).toBe(false)
    })

    it('should wait for the current block height', () => {
      expect(isSwapTimedOut('pending', 900_000, undefined)).toBe(false)
    })
  })
})
