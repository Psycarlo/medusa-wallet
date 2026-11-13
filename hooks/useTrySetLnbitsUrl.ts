import { useCallback, useState } from 'react'
import { toast } from 'sonner-native'

import { t } from '@/locales'
import { isSignedIn } from '@/machines/session'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { normalizeBaseUrl } from '@/utils/url'

import useLogout from './useLogout'

function useTrySetLnbitsUrl() {
  const logout = useLogout()
  const setLnbitsUrl = useSettingsStore((state) => state.setLnbitsUrl)
  const [loading, setLoading] = useState(false)

  const trySetLnbitsUrl = useCallback(
    async (lnbitsUrl: string) => {
      const newLnbitsUrl = normalizeBaseUrl(lnbitsUrl)
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
        if (isSignedIn(useAuthStore.getState().status)) await logout()
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
