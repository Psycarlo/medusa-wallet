export const MEDUSA_URL = 'medusa.bz'
export const HISTORICAL_PRICES_INTERVAL = 180 // 3 minutes
// The price API answers with the closest price it has, which can be far from
// the requested time (e.g. before its history starts)
export const MAX_PRICE_TIME_DIFFERENCE = 60 * 60 // 1 hour
