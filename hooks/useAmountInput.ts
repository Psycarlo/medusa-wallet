import { useCallback, useReducer } from 'react'

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

type AmountState = {
  amountType: MAmountDisplayType
  /** Amount in the user's bitcoin unit, as typed */
  amount: string
  /** Fiat amount, as typed */
  fiat: string
}

type AmountAction =
  | { type: 'key'; key: Keys; rate: number; unit: SupportedBitcoinUnits }
  | { type: 'setSats'; sats: number; rate: number; unit: SupportedBitcoinUnits }
  | { type: 'setAmountType'; amountType: MAmountDisplayType }
  | { type: 'reset' }

const initialState: AmountState = { amountType: 'btc', amount: '0', fiat: '0' }

function amountReducer(state: AmountState, action: AmountAction): AmountState {
  switch (action.type) {
    case 'key': {
      const { key, rate, unit } = action
      if (state.amountType === 'btc') {
        const amount = appendKey(
          state.amount,
          key,
          unit === 'btc' ? BTC_DECIMALS : 0
        )
        const fiat = satsToFiat(unitToSats(amount, unit), rate)
        return { ...state, amount, fiat }
      }
      const fiat = appendKey(state.fiat, key, FIAT_DECIMALS)
      const amount = satsToUnit(fiatToSats(fiat, rate), unit)
      return { ...state, amount, fiat }
    }
    case 'setSats':
      return {
        ...state,
        amount: satsToUnit(action.sats, action.unit),
        fiat: satsToFiat(action.sats, action.rate)
      }
    case 'setAmountType':
      // Drop trailing zeros (e.g. "0.00") so typing continues naturally
      return {
        ...state,
        amountType: action.amountType,
        fiat: String(Number(state.fiat) || 0)
      }
    case 'reset':
      return { ...state, amount: '0', fiat: '0' }
  }
}

/**
 * Keypad state for entering an amount either in the user's bitcoin unit
 * (sats or btc) or in fiat, keeping both representations in sync.
 */
function useAmountInput(rate: number, bitcoinUnit: SupportedBitcoinUnits) {
  const [state, dispatch] = useReducer(amountReducer, initialState)

  const handleKeyPress = useCallback(
    (key: Keys) => dispatch({ type: 'key', key, rate, unit: bitcoinUnit }),
    [rate, bitcoinUnit]
  )

  const setSats = useCallback(
    (sats: number) =>
      dispatch({ type: 'setSats', sats, rate, unit: bitcoinUnit }),
    [rate, bitcoinUnit]
  )

  const setAmountType = useCallback(
    (amountType: MAmountDisplayType) =>
      dispatch({ type: 'setAmountType', amountType }),
    []
  )

  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  return {
    amountType: state.amountType,
    setAmountType,
    /** Entered amount converted to sats */
    sats: unitToSats(state.amount, bitcoinUnit),
    /** Amount as typed when entering BTC, so decimals show while typing */
    amountText: bitcoinUnit === 'btc' ? state.amount : undefined,
    fiat: Number(state.fiat),
    numPadType: state.amountType === 'btc' ? bitcoinUnit : ('fiat' as const),
    handleKeyPress,
    setSats,
    reset
  }
}

export { amountReducer, appendKey, satsToUnit, unitToSats }
export default useAmountInput
