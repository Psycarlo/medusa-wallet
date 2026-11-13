import { getHost, normalizeBaseUrl } from '@/utils/url'

describe('url utils', () => {
  describe('normalizeBaseUrl', () => {
    it('should remove trailing slashes', () => {
      expect(normalizeBaseUrl('https://wallet.medusa.bz/')).toBe(
        'https://wallet.medusa.bz'
      )
      expect(normalizeBaseUrl('https://lnbits.example.com/lnbits//')).toBe(
        'https://lnbits.example.com/lnbits'
      )
    })

    it('should remove surrounding whitespace', () => {
      expect(normalizeBaseUrl('  https://wallet.medusa.bz/ \n')).toBe(
        'https://wallet.medusa.bz'
      )
    })

    it('should keep urls that are already normalized', () => {
      expect(normalizeBaseUrl('https://wallet.medusa.bz')).toBe(
        'https://wallet.medusa.bz'
      )
    })
  })

  describe('getHost', () => {
    it('should return the host of a url', () => {
      expect(getHost('https://lnbits.example.com')).toBe('lnbits.example.com')
      expect(getHost('https://lnbits.example.com/lnbits/')).toBe(
        'lnbits.example.com'
      )
      expect(getHost('http://192.168.1.10:5000?x=1')).toBe('192.168.1.10:5000')
    })
  })
})
