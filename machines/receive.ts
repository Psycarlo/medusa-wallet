/**
 * Receive screen state machine: which payment request is shown.
 *
 *   address | empty ──INVOICE_CREATED──▶ invoice
 *   invoice ──INVOICE_SETTLED | INVOICE_FAILED | AMOUNT_CLEARED──▶ address | empty
 *
 * - `address`: the reusable lightning address of the default wallet.
 * - `empty`: other wallets have no address, an amount is needed first.
 * - `invoice`: single-use invoice for the requested amount. Once settled
 *   (paid or expired) it can't be paid again, so it is never left on screen.
 */
type ReceiveInvoice = {
  bolt11: string
  /** Unix time in milliseconds */
  expiresAt: number
}

type ReceiveState = {
  /** Requested amount in sats, 0 when none */
  amount: number
  comment: string
  /** Invoice created for the requested amount */
  invoice: ReceiveInvoice | null
}

type ReceiveEvent =
  | { type: 'AMOUNT_SET'; amount: number }
  | { type: 'AMOUNT_CLEARED' }
  | { type: 'COMMENT_SET'; comment: string }
  | { type: 'INVOICE_CREATED'; invoice: ReceiveInvoice }
  | { type: 'INVOICE_FAILED' }
  /** Paid or expired */
  | { type: 'INVOICE_SETTLED'; bolt11: string }

type ReceiveRequest =
  | { type: 'address'; lnurl: string }
  | { type: 'invoice'; bolt11: string; expiresAt: number }
  | { type: 'empty' }

const initialReceiveState: ReceiveState = {
  amount: 0,
  comment: '',
  invoice: null
}

function receiveReducer(
  state: ReceiveState,
  event: ReceiveEvent
): ReceiveState {
  switch (event.type) {
    case 'AMOUNT_SET':
      return { ...state, amount: event.amount }
    case 'COMMENT_SET':
      return { ...state, comment: event.comment }
    case 'INVOICE_CREATED':
      // The amount was cleared while the invoice was being created
      if (state.amount === 0) return state
      return { ...state, invoice: event.invoice }
    case 'AMOUNT_CLEARED':
    case 'INVOICE_FAILED':
      return { ...state, amount: 0, invoice: null }
    case 'INVOICE_SETTLED':
      // An outdated invoice must not clear the one that replaced it
      if (state.invoice?.bolt11 !== event.bolt11) return state
      return { ...state, amount: 0, invoice: null }
  }
}

/**
 * What to show for the current state. `lnurl` is the lightning address of the
 * wallet, only available for the default wallet.
 */
function getReceiveRequest(
  state: ReceiveState,
  lnurl: string | undefined
): ReceiveRequest {
  if (state.invoice) return { type: 'invoice', ...state.invoice }
  if (lnurl) return { type: 'address', lnurl }
  return { type: 'empty' }
}

export type { ReceiveEvent, ReceiveInvoice, ReceiveRequest, ReceiveState }
export { getReceiveRequest, initialReceiveState, receiveReducer }
