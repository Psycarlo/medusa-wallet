import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

import { isValidInvoice } from '@/utils/invoice'

/**
 * Exposes whether the clipboard has text and a way to read an invoice from it.
 *
 * Content is only read when the user asks to paste: reading it eagerly shows
 * the "pasted from your clipboard" toast on Android and the paste permission
 * prompt on iOS every time the screen opens.
 */
function useClipboardInvoice() {
  const [canPaste, setCanPaste] = useState(false)

  useEffect(() => {
    let active = true

    async function checkClipboard() {
      const hasString = await Clipboard.hasStringAsync()
      if (active) setCanPaste(hasString)
    }

    checkClipboard()

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkClipboard()
    })

    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  const readInvoice = useCallback(async () => {
    const text = (await Clipboard.getStringAsync()).trim()
    return isValidInvoice(text) ? text : null
  }, [])

  return { canPaste, readInvoice }
}

export default useClipboardInvoice
