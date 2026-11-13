import TimeAgo from 'react-timeago'

import { t } from '@/locales'
import { formatDate, formatTime } from '@/utils/format'

import MText, { type MTextProps } from './MText'

type MTimeAgoTextProps = {
  timestamp: number
  textProps?: MTextProps
}

export default function MTimeAgoText({
  timestamp,
  textProps
}: MTimeAgoTextProps) {
  function timeFormatter(value: number, unit: string) {
    if (unit === 'second') return t('timeAgo.fewMoments')
    if (unit === 'minute') return t('timeAgo.minutes', { count: value })
    if (unit === 'hour') return t('timeAgo.hours', { count: value })
    return `${formatDate(timestamp)} ${formatTime(timestamp)}`
  }

  if (timestamp === 0)
    return (
      <MText size="sm" {...textProps}>
        {t('noTransactionsYet')}
      </MText>
    )

  return (
    <TimeAgo
      date={timestamp}
      live
      component={(props: any) => (
        <MText size="sm" {...textProps}>
          {props.children}
        </MText>
      )}
      formatter={timeFormatter}
    />
  )
}
