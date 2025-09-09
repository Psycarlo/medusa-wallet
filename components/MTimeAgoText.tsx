import TimeAgo from 'react-timeago'

import { formatDate, formatTime } from '@/utils/format'

import MText, { type MTextProps } from './MText'

type MTimeAgoTextProps = {
  timestamp: number
  textProps?: MTextProps
}

export default function SSTimeAgoText({
  timestamp,
  textProps
}: MTimeAgoTextProps) {
  function timeFormatter(value: number, unit: string, suffix: string) {
    if (unit === 'second') return `Few moments ago ${suffix}`
    else if (unit === 'minute' || unit === 'hour')
      return `${value} ${unit}${value !== 1 ? 's' : ''} ${suffix}`
    else return `${formatDate(timestamp)} ${formatTime(timestamp)}`
  }

  if (timestamp === 0)
    return (
      <MText size="sm" {...textProps}>
        No transactions yet
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
