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

async function getBitcoinPricesAt(timestamp: number) {
  const response = await fetch(
    `${API_URL}/btcPriceAll?unix_time=${timestamp}`,
    {
      headers,
      method: 'GET'
    }
  )
  const json = await response.json()

  const data = TimestampPriceSchema.parse(json)

  return data.bitcoin
}

async function getPricesAt(sats: number, timestamp: number) {
  const response = await fetch(
    `${API_URL}/btcPriceAll?unix_time=${timestamp}`,
    {
      headers,
      method: 'GET'
    }
  )
  const json = await response.json()

  const data = TimestampPriceSchema.parse(json)

  const prices = data.bitcoin
  for (const fiat in data.bitcoin) {
    prices[fiat as keyof typeof data.bitcoin] = Number(
      (
        (sats / SATOSHIS_IN_BITCOIN) *
        data.bitcoin[fiat as keyof typeof data.bitcoin]
      ).toFixed(2)
    )
  }

  return prices
}

export default { getBitcoinPricesAt, getPricesAt }
