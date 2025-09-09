import parse from '@/utils/parse'

describe('parse utils', () => {
  describe('lnaddress', () => {
    it('should return lnaddress parts if address is valid', () => {
      expect(parse.lnaddress('psycarlo@walletofsatoshi.com')).toEqual({
        username: 'psycarlo',
        domain: 'walletofsatoshi.com'
      })
      expect(parse.lnaddress('medusa@medusa.bz')).toEqual({
        username: 'medusa',
        domain: 'medusa.bz'
      })
    })

    it('should return false if address is invalid', () => {
      expect(parse.lnaddress('@medusa.bz')).toBeFalsy()
      expect(parse.lnaddress('psycarlo@')).toBeFalsy()
      expect(parse.lnaddress('  @medusa.bz')).toBeFalsy()
      expect(parse.lnaddress('psycarlo@  ')).toBeFalsy()
      expect(parse.lnaddress('psycarlo@medusa')).toBeFalsy()
      expect(parse.lnaddress('psycarlo@medusa.s')).toBeFalsy()
    })
  })
})
