import { LNBITS_DEFAULT_URL } from '@/config/lnbits'
import { HISTORICAL_PRICES_INTERVAL, MEDUSA_URL } from '@/config/medusa'

import { getHost, normalizeBaseUrl } from './url'

type HistoricalPriceEntry = {
  id: string
  timestamp: number
}

function getHistoricalPricesMap(entries: HistoricalPriceEntry[]) {
  const result: Record<number, string[]> = {}

  for (const entry of entries) {
    const existingKey = Object.keys(result).find(
      (key) =>
        Math.abs(Number(key) - entry.timestamp) <= HISTORICAL_PRICES_INTERVAL
    )

    if (existingKey) result[Number(existingKey)].push(entry.id)
    else result[entry.timestamp] = [entry.id]
  }

  return result
}

/**
 * Lightning address of a paylink. LNbits serves them on its own host, except
 * the default server, whose addresses live on the Medusa domain.
 */
function getPaylinkAddress(username: string, lnbitsUrl: string) {
  const domain =
    normalizeBaseUrl(lnbitsUrl) === LNBITS_DEFAULT_URL
      ? MEDUSA_URL
      : getHost(lnbitsUrl)

  return `${username}@${domain}`
}

export { getHistoricalPricesMap, getPaylinkAddress }
