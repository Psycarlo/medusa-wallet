import { useCallback } from 'react'

import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import { useSettingsStore } from '@/store/settings'
import { formatNumber } from '@/utils/format'
import number from '@/utils/number'

function useFormatBitcoinUnit() {
  const bitcoinUnit = useSettingsStore((state) => state.bitcoinUnit)

  const getFormattedBitcoinUnitAmount = useCallback(
    (sats: number) => {
      const decimals =
        bitcoinUnit === 'btc'
          ? number.getDecimalPlaces(sats / SATOSHIS_IN_BITCOIN)
          : 0
      return bitcoinUnit === 'btc'
        ? formatNumber(sats / SATOSHIS_IN_BITCOIN, decimals)
        : formatNumber(sats, 0, true)
    },
    [bitcoinUnit]
  )

  const getFormattedBitcoinUnitLabel = useCallback(
    () => bitcoinUnit,
    [bitcoinUnit]
  )

  return { getFormattedBitcoinUnitAmount, getFormattedBitcoinUnitLabel }
}

export default useFormatBitcoinUnit
