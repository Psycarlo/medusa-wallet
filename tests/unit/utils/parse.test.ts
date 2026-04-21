import parse from '@/utils/parse'

describe('parse utils', () => {
  describe('fromLnbitsWalletToWallet', () => {
    it('should convert lnbits wallet to wallet', () => {
      const lnbitsWallet = {
        id: 'abc123',
        name: 'My Wallet',
        adminkey: 'admin_key',
        inkey: 'in_key',
        balance_msat: 5000000,
        user: 'user1',
        currency: null,
        deleted: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      }

      const result = parse.fromLnbitsWalletToWallet(lnbitsWallet)

      expect(result.id).toBe('abc123')
      expect(result.name).toBe('My Wallet')
      expect(result.adminkey).toBe('admin_key')
      expect(result.inkey).toBe('in_key')
      expect(result.balance).toBe(5000)
      expect(result.transactions).toEqual([])
    })
  })

  describe('fromLnbitsPaymentToTransaction', () => {
    it('should convert incoming payment', () => {
      const payment = {
        payment_hash: 'hash123',
        amount: 10000,
        fee: 0,
        memo: 'test payment',
        time: '2024-01-15T12:00:00.000Z',
        wallet_id: 'wallet1',
        bolt11: 'lnbc...',
        pending: false,
        checking_id: 'check1',
        preimage: 'preimage1',
        webhook: null,
        webhook_status: null,
        expiry: '2024-01-15T13:00:00.000Z',
        extra: {}
      }

      const result = parse.fromLnbitsPaymentToTransaction(payment)

      expect(result.id).toBe('hash123')
      expect(result.type).toBe('in')
      expect(result.sats).toBe(10)
      expect(result.note).toBe('test payment')
      expect(result.walletId).toBe('wallet1')
      expect(result.fee).toBe(0)
    })

    it('should convert outgoing payment', () => {
      const payment = {
        payment_hash: 'hash456',
        amount: -50000,
        fee: 1000,
        memo: 'sent',
        time: '2024-01-15T12:00:00.000Z',
        wallet_id: 'wallet1',
        bolt11: 'lnbc...',
        pending: false,
        checking_id: 'check1',
        preimage: 'preimage1',
        webhook: null,
        webhook_status: null,
        expiry: '2024-01-15T13:00:00.000Z',
        extra: {}
      }

      const result = parse.fromLnbitsPaymentToTransaction(payment)

      expect(result.type).toBe('out')
      expect(result.sats).toBe(50)
      expect(result.fee).toBe(1)
    })
  })

  describe('fromLnbitsPaylinkToPaylink', () => {
    it('should convert lnbits paylink to paylink', () => {
      const lnbitsPaylink = {
        id: 'pl1',
        username: 'medusa',
        min: 1,
        max: 1000000,
        comment_chars: 100,
        lnurl: 'lnurl1dp68gurn8ghj7...',
        wallet: 'wallet1',
        served_meta: 1,
        served_pr: 1
      }

      const result = parse.fromLnbitsPaylinkToPaylink(lnbitsPaylink)

      expect(result).toEqual({
        id: 'pl1',
        username: 'medusa',
        min: 1,
        max: 1000000,
        commentChars: 100,
        lnurl: 'lnurl1dp68gurn8ghj7...'
      })
    })
  })

  describe('getOldestWallet', () => {
    it('should return undefined for empty or undefined wallets', () => {
      expect(parse.getOldestWallet(undefined)).toBeUndefined()
      expect(parse.getOldestWallet([])).toBeUndefined()
    })

    it('should return the oldest wallet', () => {
      const wallets = [
        {
          id: '1',
          name: 'New',
          adminkey: 'a',
          inkey: 'i',
          balance: 0,
          transactions: [],
          createdAt: 5000,
          updatedAt: null
        },
        {
          id: '2',
          name: 'Old',
          adminkey: 'a',
          inkey: 'i',
          balance: 0,
          transactions: [],
          createdAt: 1000,
          updatedAt: null
        }
      ]

      expect(parse.getOldestWallet(wallets)?.id).toBe('2')
    })
  })

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
