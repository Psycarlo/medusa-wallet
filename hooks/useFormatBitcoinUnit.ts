import { useCallback } from 'react'

import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import { useSettingsStore } from '@/store/settings'
import { formatNumber } from '@/utils/format'
import number from '@/utils/number'

function useFormatBitcoinUnit() {
  const bitcoinUnit = useSettingsStore((state) => state.bitcoinUnit)

  const getFormattedBitcoinUnitAmount = useCallback(
    (sats: number) => {
      if (bitcoinUnit !== 'btc') return formatNumber(sats, 0, true)

      // Balances can hold fractions of a sat (fees are paid in msats)
      const btc = Math.floor(sats) / SATOSHIS_IN_BITCOIN
      return formatNumber(btc, number.getDecimalPlaces(btc))
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
