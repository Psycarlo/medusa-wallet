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
})
