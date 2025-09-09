import {
  fiatCurrencyDictionary,
  type SupportedFiatCurrencies
} from '@/config/fiat'

function getName(currency: SupportedFiatCurrencies) {
  return fiatCurrencyDictionary[currency].name
}

function getSymbol(currency: SupportedFiatCurrencies) {
  return fiatCurrencyDictionary[currency].symbol
}

export default { getName, getSymbol }
