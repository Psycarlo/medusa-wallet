import { type Wallet } from '@/types/wallet'

function isDefaultWallet(id: Wallet['id'], wallets: Wallet[]) {
  if (!wallets.length) return false
  if (wallets.length === 1) return id === wallets[0].id

  const sortedWallets = [...wallets].sort((a, b) => a.createdAt - b.createdAt)
  return id === sortedWallets[0].id
}

function getDefaultWallet(wallets: Wallet[]) {
  if (!wallets.length) return null
  if (wallets.length === 1) return wallets[0]

  const sortedWallets = [...wallets].sort((a, b) => a.createdAt - b.createdAt)
  return sortedWallets[0]
}

export { getDefaultWallet, isDefaultWallet }
