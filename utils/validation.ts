function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidBitcoinAddress(address: string) {
  // Does not check for valid checksum. Soft validation.
  const legacy = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const segwit = /^(bc1)[0-9ac-hj-np-z]{8,87}$/i

  return legacy.test(address) || segwit.test(address)
}

export default { isValidEmail, isValidBitcoinAddress }
