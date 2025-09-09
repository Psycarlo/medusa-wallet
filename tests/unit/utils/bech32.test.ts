import { bech32 } from '@/utils/bech32'

describe('bech32 utils', () => {
  describe('bech32', () => {
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
  })
})
