import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'

/** Ends the session and removes everything that belongs to the user */
function useLogout() {
  const router = useRouter()

  const logout = useCallback(async () => {
    const { signOut, setPin } = useAuthStore.getState()

    signOut()
    useWalletsStore.getState().clearStore()
    await setPin('')
    useSettingsStore.getState().updateAppLock('PIN_REMOVED')
    if (router.canGoBack()) router.back()
    router.replace('/signin')
  }, [router])

  return logout
}

export default useLogout
