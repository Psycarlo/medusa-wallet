import { HISTORICAL_PRICES_INTERVAL, MEDUSA_URL } from '@/config/medusa'

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

function getPaylinkAddress(username: string) {
  return `${username}@${MEDUSA_URL}`
}

export { getHistoricalPricesMap, getPaylinkAddress }
