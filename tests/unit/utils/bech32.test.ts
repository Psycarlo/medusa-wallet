import { bech32 } from '@/utils/bech32'

describe('bech32 utils', () => {
  describe('decode', () => {
    it('should decode lnurl payment request', () => {
      const lnurl1 =
        'LNURL1DP68GURN8GHJ7AMPD3KX2AR0VEEKZAR0WD5XJTNRDAKJ7TNHV4KXCTTTDEHHWM30D3H82UNVWQHHQUMEVDSHYMR0ASLX4N'
      const lnurl2 =
        'LNURL1DP68GURN8GHJ7AMPD3KX2APWD4JKGATNVYHXY730D3H82UNVWQHNJ6Z5VFVHS7YRG52'

      const result1 = bech32.decode(lnurl1, 1500)
      const result2 = bech32.decode(lnurl2, 1500)

      expect(result1.prefix).toEqual('lnurl')
      expect(result2.prefix).toEqual('lnurl')

      expect(String.fromCharCode(...bech32.fromWords(result1.words))).toEqual(
        'https://walletofsatoshi.com/.well-known/lnurlp/psycarlo'
      )
      expect(String.fromCharCode(...bech32.fromWords(result2.words))).toEqual(
        'https://wallet.medusa.bz/lnurlp/9hTbYx'
      )
    })

    it('should throw on invalid checksum', () => {
      expect(() => bech32.decode('lnurl1invalidchecksum')).toThrow()
    })

    it('should throw on mixed case', () => {
      expect(() => bech32.decode('Lnurl1DP68GuRn')).toThrow()
    })
  })

  describe('decodeUnsafe', () => {
    it('should return undefined for invalid input', () => {
      expect(bech32.decodeUnsafe('invalid')).toBeUndefined()
    })

    it('should return decoded result for valid input', () => {
      const lnurl =
        'LNURL1DP68GURN8GHJ7AMPD3KX2APWD4JKGATNVYHXY730D3H82UNVWQHNJ6Z5VFVHS7YRG52'
      const result = bech32.decodeUnsafe(lnurl, 1500)
      expect(result).toBeDefined()
      expect(result!.prefix).toBe('lnurl')
    })
  })

  describe('encode', () => {
    it('should encode and decode roundtrip', () => {
      const original = 'https://wallet.medusa.bz/lnurlp/9hTbYx'
      const words = bech32.toWords(
        Array.from(original).map((c) => c.charCodeAt(0))
      )
      const encoded = bech32.encode('lnurl', words, 1500)
      const decoded = bech32.decode(encoded, 1500)

      expect(decoded.prefix).toBe('lnurl')
      expect(String.fromCharCode(...bech32.fromWords(decoded.words))).toBe(
        original
      )
    })

    it('should throw if exceeds length limit', () => {
      const longWords = new Array(100).fill(0)
      expect(() => bech32.encode('lnurl', longWords, 50)).toThrow(
        'Exceeds length limit'
      )
    })
  })

  describe('toWords / fromWords', () => {
    it('should convert bytes to words and back', () => {
      const bytes = [72, 101, 108, 108, 111]
      const words = bech32.toWords(bytes)
      const result = bech32.fromWords(words)
      expect(result).toEqual(bytes)
    })
  })
})
