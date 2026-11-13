import {
  getReceiveRequest,
  initialReceiveState,
  type ReceiveEvent,
  receiveReducer,
  type ReceiveState
} from '@/machines/receive'

function run(events: ReceiveEvent[], state = initialReceiveState) {
  return events.reduce(receiveReducer, state)
}

const invoice = { bolt11: 'lnbc1first', expiresAt: 1000 }
const newerInvoice = { bolt11: 'lnbc1second', expiresAt: 2000 }

const withInvoice: ReceiveState = { amount: 500, comment: 'coffee', invoice }

describe('receive machine', () => {
  describe('receiveReducer', () => {
    it('should start without amount, comment or invoice', () => {
      expect(initialReceiveState).toEqual({
        amount: 0,
        comment: '',
        invoice: null
      })
    })

    it('should show the invoice created for the amount', () => {
      const state = run([
        { type: 'AMOUNT_SET', amount: 500 },
        { type: 'INVOICE_CREATED', invoice }
      ])
      expect(state).toEqual({ amount: 500, comment: '', invoice })
    })

    it('should keep the current invoice while a new one is created', () => {
      const state = run([{ type: 'AMOUNT_SET', amount: 900 }], withInvoice)
      expect(state.invoice).toBe(invoice)

      const replaced = run(
        [{ type: 'INVOICE_CREATED', invoice: newerInvoice }],
        state
      )
      expect(replaced.invoice).toBe(newerInvoice)
    })

    it('should ignore an invoice created after the amount was cleared', () => {
      const state = run([
        { type: 'AMOUNT_SET', amount: 500 },
        { type: 'AMOUNT_CLEARED' },
        { type: 'INVOICE_CREATED', invoice }
      ])
      expect(state.invoice).toBeNull()
    })

    it('should drop the invoice with its amount, keeping the comment', () => {
      const cleared = { amount: 0, comment: 'coffee', invoice: null }

      expect(run([{ type: 'AMOUNT_CLEARED' }], withInvoice)).toEqual(cleared)
      expect(run([{ type: 'INVOICE_FAILED' }], withInvoice)).toEqual(cleared)
      expect(
        run([{ type: 'INVOICE_SETTLED', bolt11: invoice.bolt11 }], withInvoice)
      ).toEqual(cleared)
    })

    it('should not let an outdated invoice clear the current one', () => {
      const state: ReceiveState = { ...withInvoice, invoice: newerInvoice }

      expect(
        run([{ type: 'INVOICE_SETTLED', bolt11: invoice.bolt11 }], state)
      ).toBe(state)
    })

    it('should keep the invoice when only the comment changes', () => {
      const state = run([{ type: 'COMMENT_SET', comment: 'tea' }], withInvoice)
      expect(state).toEqual({ ...withInvoice, comment: 'tea' })
    })
  })

  describe('getReceiveRequest', () => {
    it('should show the lightning address of the default wallet', () => {
      expect(getReceiveRequest(initialReceiveState, 'lnurl1abc')).toEqual({
        type: 'address',
        lnurl: 'lnurl1abc'
      })
    })

    it('should ask for an amount when there is no lightning address', () => {
      expect(getReceiveRequest(initialReceiveState, undefined)).toEqual({
        type: 'empty'
      })
    })

    it('should show the invoice over the lightning address', () => {
      const request = { type: 'invoice', ...invoice }

      expect(getReceiveRequest(withInvoice, 'lnurl1abc')).toEqual(request)
      expect(getReceiveRequest(withInvoice, undefined)).toEqual(request)
    })
  })
})
