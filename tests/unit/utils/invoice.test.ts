import { type WellKnown } from '@/types/lnaddress'
import { type Bolt11 } from '@/utils/bolt11'
import {
  decodeInvoice,
  isValidInvoice,
  normalizeInvoice
} from '@/utils/invoice'

describe('invoice utils', () => {
  describe('isValidInvoice', () => {
    it('should validate lightning addresses', () => {
      const lnaddress1 = 'medusa@medusa.bz'
      const lnaddress2 = 'medusa@walletofsatoshi.com'
      const lnaddress3 = 'medusa.com'

      expect(isValidInvoice(lnaddress1)).toBeTruthy()
      expect(isValidInvoice(lnaddress2)).toBeTruthy()
      expect(isValidInvoice(lnaddress3)).toBeFalsy()
    })

    it('should validate lnurls', () => {
      const lnurl1 =
        'LNURL1DP68GURN8GHJ7AMPD3KX2AR0VEEKZAR0WD5XJTNRDAKJ7TNHV4KXCTTTDEHHWM30D3H82UNVWQHHQUMEVDSHYMR0ASLX4N'
      const lnurl2 =
        'LNURL1DP68GURN8GHJ7URP0YHXYMRFDE4JUUMK9UH8WETVDSKKKMN0WAHZ7MRWW4EXCUP0WPEHJCMPWFKX7QE84UT'
      const lnurl3 =
        'LNURL1DP68GURN8GHJ7URP0YHXYMRFDE4JUUMK9UH8WETVDSKKKMN0WAHZ7MRWW4EXCUP0WPEHJCMPWFKX7QE84U'

      expect(isValidInvoice(lnurl1)).toBeTruthy()
      expect(isValidInvoice(lnurl2)).toBeTruthy()
      expect(isValidInvoice(lnurl3)).toBeFalsy()
    })

    it('should validate bolt11', () => {
      const bolt11_1 =
        'LNBC1171400N1PN7CAEMPP54G74L06KWRHMKZ3DLRWL5DNC6669X4JN9KWLZT7X3FUWE3FT4GFQDQQCQZZSXQYZ5VQSP5ST48PCXNP9PK86VMDSY4GPCU50VTUC04MXXGUUZXDVG7XAFXNT9S9QXPQYSGQ554NL9EHFQR908M4K7STSFRN5Y0HVQX3344DYCKRZ2E8YRFQHWU39A0HN5L8GK25Y2RNMWD4CVWGKKTVMC96LSDEV5MAM6P9T7G46KQQYV2740'
      const bolt11_2 =
        'LNBC1170990N1PN7CAUSPP570Y6V5XMU8WL59PCHATJ83X5WLZJJ9TKT34WG4S6UPZ6MH5JKJVQDP82PSHJGR5DUSYYMRFDE4JQ4MPD3KX2APQ24EK2USCQZPUXQRWZQSP5NU53NVT69VHUVZ70Q8XZDQ2LT37XUWTXQQ45AAH362RN3ZH99C6Q9QXPQYSGQWKFZZDSF20H4988C4CTSA9F6JAUD22AYXWLZWAUKSC7UXTMT3JTZFNXQKVGHDAJ4T90DASDVWC28HFCVXF8GXHAXL0EDVXJZ9TU7FNSPKMCTZ4'

      expect(isValidInvoice(bolt11_1)).toBeTruthy()
      expect(isValidInvoice(bolt11_2)).toBeTruthy()
    })

    it('should validate with lightning scheme', () => {
      const lightningScheme1 =
        'lightning:LNURL1DP68GURN8GHJ7AMPD3KX2APWD4JKGATNVYHXY730D3H82UNVWQHNJ6Z5VFVHS7YRG52'
      const lightningScheme2 =
        'lightning:LNBC10U1PN7CMNLPP53PU6RVRGFU5S7G2C95HEZ30XNDNXFNCJM57N9XRXFPUZ795XRRZSDQ9DPJHJCQZZSXQRRSSSP5Q33HN9PT676S55AS5Z48LX7CJZYQN3TADJ53AQ48285HUPQQ6W8Q9P4GQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQPQYSGQHKVSWVAW7D08ZL9837Y0FNHX2VK4CVUHHS4Z6VWZ2SSZA8MEAJES7CDL7M06GZ4S63QYY3D0EYA773FL82GFPGX52VSPK4FVV9EQL3SPYV4RQ5'

      expect(isValidInvoice(lightningScheme1)).toBeTruthy()
      expect(isValidInvoice(lightningScheme2)).toBeTruthy()
    })
  })

  describe('decodeInvoice', () => {
    it('should decode lightning addresses', async () => {
      const lnaddress1 = 'medusateste@wallet.medusa.bz'
      const lnaddress2 = 'psycarlo@walletofsatoshi.com'

      const result1 = await decodeInvoice(lnaddress1)
      const result2 = await decodeInvoice(lnaddress2)

      expect(result1).not.toBeFalsy()
      expect(result2).not.toBeFalsy()

      if (!result1 || !result2) return

      const decoded1 = result1.data as WellKnown
      const decoded2 = result2.data as WellKnown

      expect(decoded1.callback).toBeDefined()
      expect(decoded2.callback).toBeDefined()

      const lnaddress3 = 'thisisnotauser@wallet.medusa.bz'
      const lnaddress4 = 'nolnserver@psycarlo.com'

      const result3 = await decodeInvoice(lnaddress3)
      const result4 = await decodeInvoice(lnaddress4)

      expect(result3).toBeFalsy()
      expect(result4).toBeFalsy()
    })

    it('should decode lnurl', async () => {
      const lnurl1 =
        'LNURL1DP68GURN8GHJ7AMPD3KX2APWD4JKGATNVYHXY730D3H82UNVWQHNJ6Z5VFVHS7YRG52'

      const result1 = await decodeInvoice(lnurl1)

      expect(result1).not.toBeFalsy()

      if (!result1) return

      const decoded1 = result1.data as WellKnown

      expect(decoded1.callback).toBeDefined()
    })

    it('should decode bolt11', async () => {
      const bolt11_1 =
        'LNBC1U1PNHAJ3VPP5K4K9UQHX0PPFS4PK9X4GNLA4T4Z4ZSKP5UGYZQ9XPJK9P6EZC2CSDQ5GCS9JMM4YPXK7MN90YSSCQZZSXQR4RQSP5URCZ7VTJNS3DH0WU96NTA5TTSSZLYNUD38WZUY4XS0KKRU5S2UCQ9P4GQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQPQYSGQ9WMJKPC3XFV2TJN0U6DLQJ4VX73Q0ZTZ9LUWTSRMTXKEL4LZP52JL90N3UEUKH7L04J639LZSTXW8MM4NZE2MXX0KJXWFEG2KCSVQGSPM76DHL'
      const bolt11_2 =
        'lnbc9640n1p5zvlw3pp5qc452k267m07ds3llxzejzp4rrtf8kwj8yk3ftqylmy449vzuawqsp5jkuduz7vm3h4zyh09ps6p7vxlypp5awu77z06vlukafk3gu6rufqxqy8ayqnp4qf0ru8dxm7pht536amqu6re6jzsf4akdc8y7x9ze3npkcd2fh8he2rzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqzudjq473cqqqqqqqqqqqqqq9qrzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqzudjq473cqqqqqqqqqqqqqq9qcqzpgdqq9qyyssq9hjkw2ewzrxsay7znpg3fg2v8nn03np2lz70rggxfdmfruyk570spp4nq6mp6a5wzt790hve3fkrpnvvrjcdhf48833kyqkjw075ctqpy4wcn8'

      const result1 = await decodeInvoice(bolt11_1)
      const result2 = await decodeInvoice(bolt11_2)

      expect(result1).not.toBeFalsy()
      expect(result2).not.toBeFalsy()

      if (!result1) return
      if (!result2) return

      const decoded1 = result1.data as Bolt11
      const decoded2 = result2.data as Bolt11

      const dTag = decoded1.data.tags.find((tag) => tag?.type === 'd')
      const dTag2 = decoded2.data.tags.find((tag) => tag?.type === 'd')

      expect(dTag).toBeDefined()
      expect(dTag.value).toBe('F You Money!')

      expect(dTag2.value).toBe('')
    })
  })

  describe('normalizeInvoice', () => {
    it('should normalize invoices correctly', () => {
      const bolt11 =
        'lightning:lnbc11110n1pnuyegnpp5r84euexg8cyypnjaq202dl5atyrutnpdf5493f44e0ux5cxdq3jsdq2gdshymr0wvcqzzsxqrrsssp52p9ywkyn0p9ladqvy990uqk460s42kscetzqr45g6dx688eaf4ks9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqewzrkt0f3cntp33qnn847frct0n5xydytwkh6zke6dt8j440m0kqgne5y88zpq5hyukcz4urrs04v92nrkehgxdlh2qq0tjqfqknm9gq7ud67s'
      const lnurl =
        'lnurl:LNURL1DP68GURN8GHJ7AMPD3KX2APWD4JKGATNVYHXY730D3H82UNVWQHNJ6Z5VFVHS7YRG52'
      const lnaddress = 'medusateste@medusa.bz'

      expect(normalizeInvoice(bolt11)).toBe(
        'lnbc11110n1pnuyegnpp5r84euexg8cyypnjaq202dl5atyrutnpdf5493f44e0ux5cxdq3jsdq2gdshymr0wvcqzzsxqrrsssp52p9ywkyn0p9ladqvy990uqk460s42kscetzqr45g6dx688eaf4ks9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqewzrkt0f3cntp33qnn847frct0n5xydytwkh6zke6dt8j440m0kqgne5y88zpq5hyukcz4urrs04v92nrkehgxdlh2qq0tjqfqknm9gq7ud67s'
      )
      expect(normalizeInvoice(lnurl)).toBe(
        'lnurl1dp68gurn8ghj7ampd3kx2apwd4jkgatnvyhxy730d3h82unvwqhnj6z5vfvhs7yrg52'
      )
      expect(normalizeInvoice(lnaddress)).toBe('medusateste@medusa.bz')
    })
  })
})
