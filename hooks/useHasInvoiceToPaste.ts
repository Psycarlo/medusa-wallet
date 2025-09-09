import * as Clipboard from 'expo-clipboard'
import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

import { isValidInvoice } from '@/utils/invoice'

function useHasInvoiceToPaste() {
  const appState = useRef(AppState.currentState)
  const [hasInvoiceToPaste, setHasInvoiceToPaste] = useState(false)
  const [invoiceValue, setInvoiceValue] = useState('')

  async function getInvoiceClipboard() {
    if (!(await Clipboard.hasStringAsync())) return
    const text = await Clipboard.getStringAsync()
    if (!isValidInvoice(text)) return
    setHasInvoiceToPaste(true)
    setInvoiceValue(text)
  }

  useEffect(() => {
    ;(async () => {
      await getInvoiceClipboard()
    })()

    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          setTimeout(async () => {
            await getInvoiceClipboard()
          }, 1) // Refactor: without timeout, getStringAsync returns false
        }
        appState.current = nextAppState
      }
    )
    return () => {
      subscription.remove()
    }
  }, [])

  return { hasInvoiceToPaste, invoiceValue }
}

export default useHasInvoiceToPaste
