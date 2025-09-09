import { CheckoutSchema, VouchersSchema } from '@/schemas/maxfy'

const BASE_URL = 'https://api.maxfy.app'
const API_URL = `${BASE_URL}/v1`
const USERNAME = 'medusa'
const PASSWORD = '1qsVbvTYxNtrrZgA'

const credentials = btoa(`${USERNAME}:${PASSWORD}`)

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Basic ${credentials}`
}

async function getVouchers() {
  const response = await fetch(`${API_URL}/vouchersGet`, {
    headers,
    method: 'GET'
  })
  const json = await response.json()

  try {
    const data = VouchersSchema.parse(json)

    return data.vouchers.filter((voucher) => voucher.active)
  } catch (_err) {
    //
  }
  return []
}

async function createTransaction(
  lnaddress: string,
  email: string,
  voucherId: number
) {
  const response = await fetch(
    `${API_URL}/transactionAdd?lnaddress=${lnaddress}&email=${email}&voucher_id=${voucherId}`,
    {
      headers,
      method: 'POST'
    }
  )
  const json = await response.json()

  const data = CheckoutSchema.parse(json)

  return data
}

export default { getVouchers, createTransaction }
