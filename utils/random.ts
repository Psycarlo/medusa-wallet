import { ADJECTIVES, MAX_NUMBER, NAMES } from '@/config/address'

function generateRandomAddress() {
  const randomAdjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)]
  const randomNumber = Math.floor(Math.random() * MAX_NUMBER) + 1

  return `${randomAdjective}${randomName}${randomNumber}`
}

export { generateRandomAddress }
