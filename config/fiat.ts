export const SUPPORTED_FIAT_CURRENCIES = [
  'usd',
  'eur',
  'gbp',
  'cad',
  'brl',
  'aud',
  'cny',
  'inr',
  'jpy',
  'chf',
  'hkd',
  'sgd',
  'sek',
  'krw',
  'nok',
  'nzd',
  'mxn',
  'twd',
  'zar',
  'dkk',
  'pln',
  'thb',
  'czk',
  'aed',
  'try',
  'huf',
  'sar',
  'php',
  'myr',
  'cop',
  'rub',
  'ron'
] as const
export type SupportedFiatCurrencies = (typeof SUPPORTED_FIAT_CURRENCIES)[number]

type FiatDetails = {
  name: string
  symbol: string
  code: string
}

export const fiatCurrencyDictionary: Record<
  SupportedFiatCurrencies,
  FiatDetails
> = {
  usd: {
    name: 'United States Dollar',
    symbol: '$',
    code: 'USD'
  },
  aed: {
    name: 'United Arab Emirates Dirham',
    symbol: 'د.إ',
    code: 'AED'
  },
  aud: {
    name: 'Australian Dollar',
    symbol: 'AU$',
    code: 'AUD'
  },
  brl: {
    name: 'Brazilian Real',
    symbol: 'R$',
    code: 'BRL'
  },
  cad: {
    name: 'Canadian Dollar',
    symbol: 'CA$',
    code: 'CAD'
  },
  chf: {
    name: 'Swiss Franc',
    symbol: 'CHF',
    code: 'CHF'
  },
  cny: {
    name: 'Chinese Yuan',
    symbol: '¥',
    code: 'CNY'
  },
  cop: {
    name: 'Colombian Peso',
    symbol: '$',
    code: 'COP'
  },
  czk: {
    name: 'Czech Koruna',
    symbol: 'Kč',
    code: 'CZK'
  },
  dkk: {
    name: 'Danish Krone',
    symbol: 'kr',
    code: 'DKK'
  },
  eur: {
    name: 'Euro',
    symbol: '€',
    code: 'EUR'
  },
  gbp: {
    name: 'British Pound',
    symbol: '£',
    code: 'GBP'
  },
  hkd: {
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    code: 'HKD'
  },
  huf: {
    name: 'Hungarian Forint',
    symbol: 'Ft',
    code: 'HUF'
  },
  inr: {
    name: 'Indian Rupee',
    symbol: '₹',
    code: 'INR'
  },
  jpy: {
    name: 'Japanese Yen',
    symbol: '¥',
    code: 'JPY'
  },
  krw: {
    name: 'South Korean Won',
    symbol: '₩',
    code: 'KRW'
  },
  mxn: {
    name: 'Mexican Peso',
    symbol: '$',
    code: 'MXN'
  },
  myr: {
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    code: 'MYR'
  },
  nok: {
    name: 'Norwegian Krone',
    symbol: 'kr',
    code: 'NOK'
  },
  nzd: {
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    code: 'NZD'
  },
  php: {
    name: 'Philippine Peso',
    symbol: '₱',
    code: 'PHP'
  },
  pln: {
    name: 'Polish Zloty',
    symbol: 'zł',
    code: 'PLN'
  },
  ron: {
    name: 'Romanian Leu',
    symbol: 'lei',
    code: 'RON'
  },
  rub: {
    name: 'Russian Ruble',
    symbol: '₽',
    code: 'RUB'
  },
  sar: {
    name: 'Saudi Riyal',
    symbol: 'ر.س',
    code: 'SAR'
  },
  sek: {
    name: 'Swedish Krona',
    symbol: 'kr',
    code: 'SEK'
  },
  sgd: {
    name: 'Singapore Dollar',
    symbol: 'S$',
    code: 'SGD'
  },
  thb: {
    name: 'Thai Baht',
    symbol: '฿',
    code: 'THB'
  },
  try: {
    name: 'Turkish Lira',
    symbol: '₺',
    code: 'TRY'
  },
  twd: {
    name: 'Taiwan Dollar',
    symbol: 'NT$',
    code: 'TWD'
  },
  zar: {
    name: 'South African Rand',
    symbol: 'R',
    code: 'ZAR'
  }
}
