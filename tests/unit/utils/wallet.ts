import { Wallet } from '@/types/wallet'
import { isDefaultWallet } from '@/utils/wallet'

describe('wallet utils', () => {
  const w1: Wallet = {
    id: '1',
    name: 'Wallet Test',
    balance: 1000,
    transactions: [],
    inkey: 'fakeinkey',
    adminkey: 'fakeadminkey',
    createdAt: 2000,
    updatedAt: 2500
  }

  const w2: Wallet = {
    id: '2',
    name: 'Wallet Test 2',
    balance: 2000,
    transactions: [],
    inkey: 'fakeinkey',
    adminkey: 'fakeadminkey',
    createdAt: 4000,
    updatedAt: 4500
  }

  describe('isDefaultWallet', () => {
    it('should return false if it is not the earliest wallet', () => {
      expect(isDefaultWallet('1', [])).toBeFalsy()
      expect(isDefaultWallet('2', [w1, w2])).toBeFalsy()
    })

    it('should return true if it is the earliest wallet', () => {
      expect(isDefaultWallet('1', [w1, w2])).toBeTruthy()
      expect(isDefaultWallet('1', [w2, w1])).toBeTruthy()
    })
  })
})
