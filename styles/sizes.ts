export const text = {
  fontSize: {
    xxs: 9,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56
  }
}

export type TextFontSize = keyof (typeof text)['fontSize']
