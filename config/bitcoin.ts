export const SUPPORTED_BITCOIN_UNITS = ['btc', 'sats'] as const
export type SupportedBitcoinUnits = (typeof SUPPORTED_BITCOIN_UNITS)[number]

export const bitcoinUnitDictionary: Record<SupportedBitcoinUnits, string> = {
  btc: 'Bitcoin',
  sats: 'Satoshi'
}
