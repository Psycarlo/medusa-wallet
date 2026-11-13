import { PIN_SIZE } from '@/config/auth'

/**
 * PIN entry state machine, shared by every screen with a PIN pad.
 *
 *   entering ──DIGIT (last one)──▶ checking ──ACCEPTED──▶ accepted
 *      ▲                              │
 *      └──DIGIT/DELETE── rejected ◀──REJECTED
 *
 * - `entering`: typing digits.
 * - `checking`: all digits typed, waiting for the screen to accept or reject
 *   them. Keys are ignored so a slow check can't be raced.
 * - `rejected`: wrong PIN, cleared and waiting for the first key.
 * - `accepted`: right PIN, nothing else to do until `RESET`.
 */
type PinEntryPhase = 'entering' | 'checking' | 'rejected' | 'accepted'

type PinEntryState = {
  phase: PinEntryPhase
  digits: string
  /** Rejected attempts since the last accepted one */
  rejections: number
}

type PinEntryEvent =
  | { type: 'DIGIT'; digit: number }
  | { type: 'DELETE' }
  | { type: 'ACCEPTED' }
  | { type: 'REJECTED' }
  | { type: 'RESET' }

const initialPinEntryState: PinEntryState = {
  phase: 'entering',
  digits: '',
  rejections: 0
}

function pinEntryReducer(
  state: PinEntryState,
  event: PinEntryEvent
): PinEntryState {
  switch (event.type) {
    case 'DIGIT': {
      if (state.phase === 'checking' || state.phase === 'accepted') return state
      const digits = `${state.digits}${event.digit}`
      return {
        ...state,
        digits,
        phase: digits.length >= PIN_SIZE ? 'checking' : 'entering'
      }
    }
    case 'DELETE':
      if (state.phase === 'checking' || state.phase === 'accepted') return state
      return { ...state, digits: state.digits.slice(0, -1), phase: 'entering' }
    case 'ACCEPTED':
      if (state.phase !== 'checking') return state
      return { ...state, phase: 'accepted', rejections: 0 }
    case 'REJECTED':
      if (state.phase !== 'checking') return state
      return {
        phase: 'rejected',
        digits: '',
        rejections: state.rejections + 1
      }
    case 'RESET':
      return { ...state, phase: 'entering', digits: '' }
  }
}

export type { PinEntryEvent, PinEntryPhase, PinEntryState }
export { initialPinEntryState, pinEntryReducer }
