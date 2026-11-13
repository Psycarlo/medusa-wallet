import { notificationAsync, NotificationFeedbackType } from 'expo-haptics'
import { useCallback, useEffect, useReducer, useRef } from 'react'

import type { Keys } from '@/components/MNumPad'
import { initialPinEntryState, pinEntryReducer } from '@/machines/pinEntry'

import { useAnimatedShake } from './useAnimatedShake'

/**
 * `true` accepts the PIN, `false` rejects it (shake, haptics and a clean
 * input). Return nothing to keep waiting, e.g. when leaving the screen.
 */
type PinCheckResult = boolean | void

/**
 * PIN pad state (see `machines/pinEntry.ts`). `onComplete` runs once all
 * digits are typed and decides whether the PIN is accepted.
 */
function usePinEntry(
  onComplete: (pin: string) => PinCheckResult | Promise<PinCheckResult>
) {
  const [state, dispatch] = useReducer(pinEntryReducer, initialPinEntryState)
  const { shake, shakeStyle } = useAnimatedShake()

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (state.phase !== 'checking') return
    let active = true

    async function check() {
      const accepted = await onCompleteRef.current(state.digits)
      if (!active || accepted === undefined) return
      if (accepted) return dispatch({ type: 'ACCEPTED' })

      dispatch({ type: 'REJECTED' })
      shake()
      await notificationAsync(NotificationFeedbackType.Error)
    }

    check()

    return () => {
      active = false
    }
  }, [state.phase, state.digits, shake])

  const handleKey = useCallback((key: Keys) => {
    if (key === 'DEL') dispatch({ type: 'DELETE' })
    else if (typeof key === 'number') dispatch({ type: 'DIGIT', digit: key })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    phase: state.phase,
    digitCount: state.digits.length,
    /** Rejected attempts since the last accepted one */
    rejections: state.rejections,
    handleKey,
    reset,
    shakeStyle
  }
}

export default usePinEntry
