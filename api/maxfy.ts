import { CheckoutPISchema, VouchersSchema } from '@/schemas/maxfy'

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

async function createTransactionPI(
  lnaddress: string,
  email: string,
  voucherId: number
) {
  const body = new URLSearchParams({
    lnaddress,
    email,
    voucher_id: String(voucherId)
  })

  const response = await fetch(`${API_URL}/transactionAddPI`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    },
    body: body.toString()
  })

  if (!response.ok) {
    throw new Error(
      `Create transaction failed: ${response.status} ${response.statusText}`
    )
  }

  const json = await response.json()

  const data = CheckoutPISchema.parse(json)

  return data
}

export default { getVouchers, createTransactionPI }
