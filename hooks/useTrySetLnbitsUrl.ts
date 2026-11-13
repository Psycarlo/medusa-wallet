import { useCallback, useState } from 'react'
import { toast } from 'sonner-native'

import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'

import useLogout from './useLogout'

function useTrySetLnbitsUrl() {
  const logout = useLogout()
  const setLnbitsUrl = useSettingsStore((state) => state.setLnbitsUrl)
  const [loading, setLoading] = useState(false)

  const trySetLnbitsUrl = useCallback(
    async (newLnbitsUrl: string) => {
      // Read current values: this callback is created once
      if (newLnbitsUrl === useSettingsStore.getState().lnbitsUrl) return
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
        if (!useAuthStore.getState().loggedOut) await logout()
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
