/**
 * A swap that is still pending once its timeout block is mined won't complete:
 * the onchain funds have to be refunded.
 */
function isSwapTimedOut(
  status: string,
  timeoutBlockHeight: number,
  currentBlockHeight: number | undefined
) {
  return status === 'pending' && timeoutBlockHeight <= (currentBlockHeight || 0)
}

export { isSwapTimedOut }
