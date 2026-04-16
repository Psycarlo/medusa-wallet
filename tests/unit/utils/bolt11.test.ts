import bolt11 from '@/utils/bolt11'

describe('bolt11 utils', () => {
  describe('decode', () => {
    it('should decode lnbc payment request', () => {
      const request =
        'lightning:LNBC1U1PNHAJ3VPP5K4K9UQHX0PPFS4PK9X4GNLA4T4Z4ZSKP5UGYZQ9XPJK9P6EZC2CSDQ5GCS9JMM4YPXK7MN90YSSCQZZSXQR4RQSP5URCZ7VTJNS3DH0WU96NTA5TTSSZLYNUD38WZUY4XS0KKRU5S2UCQ9P4GQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQPQYSGQ9WMJKPC3XFV2TJN0U6DLQJ4VX73Q0ZTZ9LUWTSRMTXKEL4LZP52JL90N3UEUKH7L04J639LZSTXW8MM4NZE2MXX0KJXWFEG2KCSVQGSPM76DHL'
      const parsedRequest = request.split(':')[1]

      const result = bolt11.decode(parsedRequest)

      const dTag = result.data.tags.find((tag) => tag.type === 'd')

      expect(dTag).toBeDefined()
      expect(dTag.value).toBe('F You Money!')

      expect(result.human_readable_part.amount).toBe(100000)
    })

    it('should decode invoice with nano amount multiplier', () => {
      const invoice =
        'lnbc9640n1p5zvlw3pp5qc452k267m07ds3llxzejzp4rrtf8kwj8yk3ftqylmy449vzuawqsp5jkuduz7vm3h4zyh09ps6p7vxlypp5awu77z06vlukafk3gu6rufqxqy8ayqnp4qf0ru8dxm7pht536amqu6re6jzsf4akdc8y7x9ze3npkcd2fh8he2rzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqzudjq473cqqqqqqqqqqqqqq9qrzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqzudjq473cqqqqqqqqqqqqqq9qcqzpgdqq9qyyssq9hjkw2ewzrxsay7znpg3fg2v8nn03np2lz70rggxfdmfruyk570spp4nq6mp6a5wzt790hve3fkrpnvvrjcdhf48833kyqkjw075ctqpy4wcn8'

      const result = bolt11.decode(invoice)

      expect(result.human_readable_part.amount).toBe(964000)
    })

    it('should throw on malformed checksum', () => {
      expect(() => bolt11.decode('lnbc1u1invalid')).toThrow()
    })
  })
})
