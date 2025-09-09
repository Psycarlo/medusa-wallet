import { Colors } from '@/styles'

export const WALLET_CARD_COLORS = [
  { id: 'bitcoin', l: Colors.bitcoin, r: Colors.bitcoinDark },
  { id: 'clearsky', l: '#005C97', r: '#363795' },
  { id: 'virginamerica', l: '#7b4397', r: '#dc2430' },
  { id: 'turquoiseflow', l: '#136a8a', r: '#267871' },
  { id: 'vine', l: '#00bf8f', r: '#001510' },
  { id: 'twitch', l: '#6441A5', r: '#2a0845' }
]
export type WalletCardColor = (typeof WALLET_CARD_COLORS)[number]
