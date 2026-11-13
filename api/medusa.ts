import { MAX_PRICE_TIME_DIFFERENCE } from '@/config/medusa'
import { SATOSHIS_IN_BITCOIN } from '@/constants/btc'
import { TimestampPriceSchema } from '@/schemas/medusa'

const BASE_URL = 'https://api.medusa.bz'
const API_URL = `${BASE_URL}/v1`
const USERNAME = 'medusa'
const PASSWORD = '1qsVbvTYxNtrrZgA'

const credentials = btoa(`${USERNAME}:${PASSWORD}`)

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Basic ${credentials}`
}

/** Bitcoin price in every supported fiat currency at `timestamp` (seconds) */
async function getBitcoinPricesAt(timestamp: number) {
  const response = await fetch(
    `${API_URL}/btcPriceAll?unix_time=${timestamp}`,
    {
      headers,
      method: 'GET'
    }
  )
  if (!response.ok) throw new Error('Unable to get bitcoin prices')

  const json = await response.json()

  const data = TimestampPriceSchema.parse(json)

  if (Math.abs(data.unix_time - timestamp) > MAX_PRICE_TIME_DIFFERENCE)
    throw new Error('No bitcoin price for that time')

  return data.bitcoin
}

async function getPricesAt(sats: number, timestamp: number) {
  const prices = await getBitcoinPricesAt(timestamp)

  for (const fiat in prices) {
    const currency = fiat as keyof typeof prices
    prices[currency] = Number(
      ((sats / SATOSHIS_IN_BITCOIN) * prices[currency]).toFixed(2)
    )
  }

  return prices
}

export default { getBitcoinPricesAt, getPricesAt }
