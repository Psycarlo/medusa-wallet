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
  })
})
