import {
  amountReducer,
  appendKey,
  satsToUnit,
  unitToSats
} from '@/hooks/useAmountInput'

describe('useAmountInput helpers', () => {
  describe('unitToSats', () => {
    it('should keep sats as integers', () => {
      expect(unitToSats('1000', 'sats')).toBe(1000)
      expect(unitToSats('0', 'sats')).toBe(0)
    })

    it('should convert btc amounts to sats', () => {
      expect(unitToSats('0.001', 'btc')).toBe(100_000)
      expect(unitToSats('1', 'btc')).toBe(100_000_000)
      expect(unitToSats('0.00000001', 'btc')).toBe(1)
      expect(unitToSats('0.', 'btc')).toBe(0)
    })

    it('should handle invalid input', () => {
      expect(unitToSats('', 'sats')).toBe(0)
      expect(unitToSats('abc', 'btc')).toBe(0)
    })
  })

  describe('satsToUnit', () => {
    it('should format sats', () => {
      expect(satsToUnit(1000, 'sats')).toBe('1000')
    })

    it('should format btc without exponent notation or trailing zeros', () => {
      expect(satsToUnit(1, 'btc')).toBe('0.00000001')
      expect(satsToUnit(100_000, 'btc')).toBe('0.001')
      expect(satsToUnit(100_000_000, 'btc')).toBe('1')
      expect(satsToUnit(1_000_000_000, 'btc')).toBe('10')
      expect(satsToUnit(0, 'btc')).toBe('0')
    })
  })

  describe('appendKey', () => {
    it('should replace the leading zero', () => {
      expect(appendKey('0', 5, 0)).toBe('5')
      expect(appendKey('5', 0, 0)).toBe('50')
    })

    it('should delete digits down to zero', () => {
      expect(appendKey('12', 'DEL', 0)).toBe('1')
      expect(appendKey('1', 'DEL', 0)).toBe('0')
    })

    it('should only allow decimals when supported', () => {
      expect(appendKey('1', ',', 0)).toBe('1')
      expect(appendKey('1', ',', 2)).toBe('1.')
      expect(appendKey('1.', ',', 2)).toBe('1.')
    })

    it('should limit decimal places', () => {
      expect(appendKey('1.2', 3, 2)).toBe('1.23')
      expect(appendKey('1.23', 4, 2)).toBe('1.23')
      expect(appendKey('0.0000000', 1, 8)).toBe('0.00000001')
      expect(appendKey('0.00000001', 1, 8)).toBe('0.00000001')
    })
  })

  describe('amountReducer', () => {
    const rate = 1000 // sats per fiat unit
    const initial = { amountType: 'btc' as const, amount: '0', fiat: '0' }

    it('should apply consecutive key presses in order', () => {
      let state = amountReducer(initial, {
        type: 'key',
        key: 1,
        rate,
        unit: 'sats'
      })
      state = amountReducer(state, { type: 'key', key: 2, rate, unit: 'sats' })
      state = amountReducer(state, { type: 'key', key: 0, rate, unit: 'sats' })
      state = amountReducer(state, { type: 'key', key: 0, rate, unit: 'sats' })
      expect(state.amount).toBe('1200')
      expect(state.fiat).toBe('1.20')
    })

    it('should sync sats when typing fiat', () => {
      let state = amountReducer(initial, {
        type: 'setAmountType',
        amountType: 'fiat'
      })
      state = amountReducer(state, { type: 'key', key: 2, rate, unit: 'btc' })
      expect(state.fiat).toBe('2')
      expect(state.amount).toBe('0.00002')
    })

    it('should drop trailing zeros when switching to fiat', () => {
      const state = amountReducer(
        { amountType: 'btc', amount: '1', fiat: '0.00' },
        { type: 'setAmountType', amountType: 'fiat' }
      )
      expect(state.fiat).toBe('0')
    })

    it('should not divide by a missing rate', () => {
      const state = amountReducer(initial, {
        type: 'key',
        key: 5,
        rate: 0,
        unit: 'sats'
      })
      expect(state.fiat).toBe('0')
    })
  })
})
