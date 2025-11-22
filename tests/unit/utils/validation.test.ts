import validation from '@/utils/validation'

describe('validation utils', () => {
  describe('isEmailValid', () => {
    it('should return true for valid email', () => {
      expect(validation.isValidEmail('medusa@medusa.bz')).toBeTruthy()
      expect(validation.isValidEmail('medusa@medusa.com')).toBeTruthy()
      expect(validation.isValidEmail('medusa1@medusa.bz')).toBeTruthy()
      expect(validation.isValidEmail('medusa.hello@medusa.bz')).toBeTruthy()
    })

    it('should return false for invalid email', () => {
      expect(validation.isValidEmail('')).toBeFalsy()
      expect(validation.isValidEmail('medusa@')).toBeFalsy()
      expect(validation.isValidEmail('medusa@medusa')).toBeFalsy()
      expect(validation.isValidEmail('medusa@medusa.')).toBeFalsy()
      expect(validation.isValidEmail('@medusa.bz')).toBeFalsy()
    })
  })

  describe('isValidBitcoinAddress', () => {
    it('should return true for valid bitcoin address', () => {
      expect(
        validation.isValidBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
      ).toBeTruthy()
      expect(
        validation.isValidBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')
      ).toBeTruthy()
      expect(
        validation.isValidBitcoinAddress(
          'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080'
        )
      ).toBeTruthy()
      expect(
        validation.isValidBitcoinAddress(
          'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7'
        )
      ).toBeTruthy()
      expect(
        validation.isValidBitcoinAddress(
          'bc1p5cyxnuxmeuwuvkwfem96l6f4tnr4f27k9m7l9p'
        )
      ).toBeTruthy()
    })

    it('should return false for invalid bitcoin address', () => {
      expect(validation.isValidBitcoinAddress('abctest')).toBeFalsy()
      expect(
        validation.isValidBitcoinAddress('1A1zP1eP5QGefi2DMPTfT')
      ).toBeFalsy()
    })
  })
})
