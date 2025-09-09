import { useCallback, useState } from 'react'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

import useLogout from './useLogout'

function useTrySetLnbitsUrl() {
  const logout = useLogout()
  const [lnbitsUrl, setLnbitsUrl] = useSettingsStore(
    useShallow((state) => [state.lnbitsUrl, state.setLnbitsUrl])
  )
  const [loading, setLoading] = useState(false)
  const loggedOut = useAuthStore((state) => state.loggedOut)

  const trySetLnbitsUrl = useCallback(
    async (newLnbitsUrl: string) => {
      if (newLnbitsUrl === lnbitsUrl) return
      setLoading(true)
      try {
        const response = await fetch(newLnbitsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok)
          throw new Error('Unable to connect to the lnbits server')

        setLnbitsUrl(newLnbitsUrl)
        if (!loggedOut) await logout()
        toast.success(t('lnbitsUrlChangeSuccess'))
      } catch {
        toast.error(t('lnbitsUrlChangeError'))
      } finally {
        setLoading(false)
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return { trySetLnbitsUrl, loading }
}

export default useTrySetLnbitsUrl
