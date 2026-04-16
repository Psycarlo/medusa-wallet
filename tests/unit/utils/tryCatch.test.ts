import { tryCatch } from '@/utils/tryCatch'

describe('tryCatch', () => {
  it('should return data on success', async () => {
    const result = await tryCatch(Promise.resolve('hello'))
    expect(result).toEqual({ data: 'hello', error: null })
  })

  it('should return error on failure', async () => {
    const error = new Error('fail')
    const result = await tryCatch(Promise.reject(error))
    expect(result).toEqual({ data: null, error })
  })

  it('should handle non-Error rejections', async () => {
    const result = await tryCatch(Promise.reject('string error'))
    expect(result).toEqual({ data: null, error: 'string error' })
  })
})
