import { useCallback, useState } from 'react'

import type { MAmountDisplayType } from '@/components/MAmountDisplay'
import type { Keys } from '@/components/MNumPad'
import type { SupportedBitcoinUnits } from '@/config/bitcoin'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'

const BTC_DECIMALS = 8
const FIAT_DECIMALS = 2

function satsToUnit(sats: number, unit: SupportedBitcoinUnits) {
  if (unit === 'sats') return String(Math.floor(sats))
  return (sats / SATOSHIS_IN_BITCOIN)
    .toFixed(BTC_DECIMALS)
    .replace(/\.?0+$/, '')
}

function unitToSats(value: string, unit: SupportedBitcoinUnits) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return unit === 'btc' ? Math.round(n * SATOSHIS_IN_BITCOIN) : Math.floor(n)
}

function satsToFiat(sats: number, rate: number) {
  return rate > 0 ? (sats / rate).toFixed(FIAT_DECIMALS) : '0'
}

function fiatToSats(fiat: string, rate: number) {
  const n = Number(fiat)
  return rate > 0 && Number.isFinite(n) ? Math.ceil(n * rate) : 0
}

function appendKey(prev: string, key: Keys, maxDecimals: number) {
  if (key === 'DEL') return prev.length > 1 ? prev.slice(0, -1) : '0'
  if (key === ',') {
    if (maxDecimals === 0 || prev.includes('.')) return prev
    return `${prev}.`
  }
  if (typeof key !== 'number') return prev

  const [, decimals] = prev.split('.')
  if (decimals !== undefined && decimals.length >= maxDecimals) return prev
  return prev === '0' ? String(key) : `${prev}${key}`
}

/**
 * Keypad state for entering an amount either in the user's bitcoin unit
 * (sats or btc) or in fiat, keeping both representations in sync.
 */
function useAmountInput(rate: number, bitcoinUnit: SupportedBitcoinUnits) {
  const [amountType, setAmountType] = useState<MAmountDisplayType>('btc')
  const [localAmount, setLocalAmount] = useState('0')
  const [localFiat, setLocalFiat] = useState('0')

  const handleKeyPress = useCallback(
    (key: Keys) => {
      if (amountType === 'btc') {
        const next = appendKey(
          localAmount,
          key,
          bitcoinUnit === 'btc' ? BTC_DECIMALS : 0
        )
        setLocalAmount(next)
        setLocalFiat(satsToFiat(unitToSats(next, bitcoinUnit), rate))
      } else {
        const next = appendKey(localFiat, key, FIAT_DECIMALS)
        const sats = fiatToSats(next, rate)
        setLocalFiat(next)
        setLocalAmount(satsToUnit(sats, bitcoinUnit))
      }
    },
    [amountType, bitcoinUnit, localAmount, localFiat, rate]
  )

  const setSats = useCallback(
    (sats: number) => {
      setLocalAmount(satsToUnit(sats, bitcoinUnit))
      setLocalFiat(satsToFiat(sats, rate))
    },
    [bitcoinUnit, rate]
  )

  const reset = useCallback(() => {
    setLocalAmount('0')
    setLocalFiat('0')
  }, [])

  return {
    amountType,
    setAmountType,
    /** Entered amount converted to sats */
    sats: unitToSats(localAmount, bitcoinUnit),
    fiat: Number(localFiat),
    numPadType: amountType === 'btc' ? bitcoinUnit : ('fiat' as const),
    handleKeyPress,
    setSats,
    reset
  }
}

export { appendKey, satsToUnit, unitToSats }
export default useAmountInput
