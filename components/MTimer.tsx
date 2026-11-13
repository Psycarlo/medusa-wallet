import { useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'

import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'
import { formatTimer } from '@/utils/format'

import MText from './MText'

const SECONDS_IN_HOUR = 60 * 60

type MTimerProps = {
  /** Unix time in milliseconds the countdown ends at */
  expiresAt: number
  withHours?: boolean
  onExpire?: () => void
}

function getSecondsLeft(expiresAt: number) {
  return Math.max(Math.ceil((expiresAt - Date.now()) / 1000), 0)
}

/**
 * Counts down to `expiresAt`. Based on the clock instead of on ticks, so it
 * stays right after the app was in the background.
 */
export default function MTimer({
  expiresAt,
  withHours = false,
  onExpire
}: MTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getSecondsLeft(expiresAt))

  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    function tick() {
      const secondsLeft = getSecondsLeft(expiresAt)
      setTimeLeft(secondsLeft)
      if (secondsLeft > 0) return
      clearInterval(timer)
      onExpireRef.current?.()
    }

    const timer = setInterval(tick, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <MVStack style={styles.stackBase}>
      <MText size="xs">
        {formatTimer(timeLeft, withHours || timeLeft >= SECONDS_IN_HOUR)}
      </MText>
    </MVStack>
  )
}

const styles = StyleSheet.create({
  stackBase: {
    backgroundColor: Colors.grayDarker,
    borderRadius: 8,
    height: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    width: 'auto'
  }
})
