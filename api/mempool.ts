import { z } from 'zod'

const MEMPOOL_URL = 'https://mempool.space'
const API_URL = `${MEMPOOL_URL}/api`

async function getCurrentBlockHeight() {
  const response = await fetch(`${API_URL}/blocks/tip/height`)
  const json = await response.json()

  const height = z.number().parse(json)

  return height
}

export default { getCurrentBlockHeight }
