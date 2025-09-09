function getDecimalPlaces(value: number) {
  if (!isFinite(value) || Math.floor(value) === value) return 0

  const valueString = value.toString()

  if (valueString.includes('e')) return Number(valueString.split('-')[1])

  const decimalPart = valueString.split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

function getPercentageChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return 0

  const percentageChange = ((newValue - oldValue) / oldValue) * 100

  if (Number.isInteger(percentageChange)) {
    return percentageChange // Return as a whole number
  } else if (Math.abs(percentageChange * 10) % 1 === 0) {
    return parseFloat(percentageChange.toFixed(1)) // Return with 1 decimal
  } else {
    return parseFloat(percentageChange.toFixed(2)) // Return with 2 decimals
  }
}

export default { getDecimalPlaces, getPercentageChange }
