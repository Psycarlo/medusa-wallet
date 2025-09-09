import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'
import { formatTimer } from '@/utils/format'

import MText from './MText'

type MTimerProps = {
  initial: number
  withHours?: boolean
}

export default function MTimer({ initial, withHours = false }: MTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initial)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <MVStack style={styles.stackBase}>
      <MText size="xs">{formatTimer(timeLeft, withHours)}</MText>
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
