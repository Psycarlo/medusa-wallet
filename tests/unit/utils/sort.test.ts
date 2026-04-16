import sort from '@/utils/sort'

describe('sort utils', () => {
  describe('sortTimestampDesc', () => {
    it('should sort timestamps in descending order', () => {
      const timestamps = [100, 300, 200, 500, 400]
      expect(timestamps.sort(sort.sortTimestampDesc)).toEqual([
        500, 400, 300, 200, 100
      ])
    })

    it('should handle equal timestamps', () => {
      expect(sort.sortTimestampDesc(100, 100)).toBe(0)
    })
  })

  describe('sortTimestampAsc', () => {
    it('should sort timestamps in ascending order', () => {
      const timestamps = [300, 100, 500, 200, 400]
      expect(timestamps.sort(sort.sortTimestampAsc)).toEqual([
        100, 200, 300, 400, 500
      ])
    })

    it('should handle equal timestamps', () => {
      expect(sort.sortTimestampAsc(100, 100)).toBe(0)
    })
  })
})
