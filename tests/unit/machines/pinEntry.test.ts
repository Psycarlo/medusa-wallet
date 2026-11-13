import { PIN_SIZE } from '@/config/auth'
import {
  initialPinEntryState,
  type PinEntryEvent,
  pinEntryReducer,
  type PinEntryState
} from '@/machines/pinEntry'

function run(events: PinEntryEvent[], state = initialPinEntryState) {
  return events.reduce(pinEntryReducer, state)
}

function typeDigits(count: number): PinEntryEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'DIGIT',
    digit: index + 1
  }))
}

describe('pin entry machine', () => {
  it('should collect digits while entering', () => {
    const state = run(typeDigits(2))
    expect(state).toEqual({ phase: 'entering', digits: '12', rejections: 0 })
  })

  it('should delete the last digit', () => {
    const state = run([...typeDigits(2), { type: 'DELETE' }])
    expect(state.digits).toBe('1')
    expect(run([{ type: 'DELETE' }]).digits).toBe('')
  })

  it('should start checking once all digits are typed', () => {
    const state = run(typeDigits(PIN_SIZE))
    expect(state.phase).toBe('checking')
    expect(state.digits).toHaveLength(PIN_SIZE)
  })

  it('should ignore keys while checking', () => {
    const checking = run(typeDigits(PIN_SIZE))
    expect(run([{ type: 'DIGIT', digit: 9 }], checking)).toBe(checking)
    expect(run([{ type: 'DELETE' }], checking)).toBe(checking)
  })

  it('should clear the digits and count the attempt when rejected', () => {
    const state = run([...typeDigits(PIN_SIZE), { type: 'REJECTED' }])
    expect(state).toEqual({ phase: 'rejected', digits: '', rejections: 1 })
  })

  it('should go back to entering on the first key after a rejection', () => {
    const rejected = run([...typeDigits(PIN_SIZE), { type: 'REJECTED' }])

    const typed = run([{ type: 'DIGIT', digit: 7 }], rejected)
    expect(typed).toEqual({ phase: 'entering', digits: '7', rejections: 1 })

    expect(run([{ type: 'DELETE' }], rejected).phase).toBe('entering')
  })

  it('should forget the rejected attempts when accepted', () => {
    const state = run([
      ...typeDigits(PIN_SIZE),
      { type: 'REJECTED' },
      ...typeDigits(PIN_SIZE),
      { type: 'ACCEPTED' }
    ])
    expect(state.phase).toBe('accepted')
    expect(state.rejections).toBe(0)
  })

  it('should ignore keys once accepted', () => {
    const accepted = run([...typeDigits(PIN_SIZE), { type: 'ACCEPTED' }])
    expect(run([{ type: 'DIGIT', digit: 1 }], accepted)).toBe(accepted)
    expect(run([{ type: 'DELETE' }], accepted)).toBe(accepted)
  })

  it('should only accept or reject while checking', () => {
    const entering = run(typeDigits(1))
    expect(run([{ type: 'ACCEPTED' }], entering)).toBe(entering)
    expect(run([{ type: 'REJECTED' }], entering)).toBe(entering)
  })

  it('should start over on reset, keeping the rejected attempts', () => {
    const state: PinEntryState = {
      phase: 'accepted',
      digits: '1234',
      rejections: 2
    }
    expect(run([{ type: 'RESET' }], state)).toEqual({
      phase: 'entering',
      digits: '',
      rejections: 2
    })
  })
})
