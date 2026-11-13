import { changeLocale, t } from '@/locales'
import { formatDate } from '@/utils/format'

describe('time ago translations', () => {
  afterEach(() => changeLocale('en'))

  it('should translate and pluralize in english', () => {
    expect(t('timeAgo.fewMoments')).toBe('Few moments ago')
    expect(t('timeAgo.minutes', { count: 1 })).toBe('1 minute ago')
    expect(t('timeAgo.minutes', { count: 5 })).toBe('5 minutes ago')
    expect(t('timeAgo.hours', { count: 2 })).toBe('2 hours ago')
  })

  it('should translate and pluralize in portuguese', () => {
    changeLocale('pt')
    expect(t('timeAgo.fewMoments')).toBe('Há poucos momentos')
    expect(t('timeAgo.minutes', { count: 1 })).toBe('Há 1 minuto')
    expect(t('timeAgo.minutes', { count: 5 })).toBe('Há 5 minutos')
    expect(t('timeAgo.hours', { count: 1 })).toBe('Há 1 hora')
    expect(t('noTransactionsYet')).toBe('Ainda sem transações')
  })

  it('should format dates in the app language', () => {
    const date = new Date(1231006505000)
    expect(formatDate(date)).toBe('Jan 3, 2009')
    changeLocale('pt')
    expect(formatDate(date)).not.toBe('Jan 3, 2009')
  })
})
