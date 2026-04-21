import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'

import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'

function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [setPin, setLoggedOut, authStoreLogout] = useAuthStore(
    useShallow((state) => [state.setPin, state.setLoggedOut, state.logout])
  )
  const clearWalletStore = useWalletsStore((state) => state.clearStore)
  const [setPinEnabled, setBiometricEnabled] = useSettingsStore(
    useShallow((state) => [state.setPinEnabled, state.setBiometricEnabled])
  )

  const logout = async () => {
    authStoreLogout()
    clearWalletStore()
    queryClient.clear()
    await setPin('')
    setPinEnabled(false)
    setBiometricEnabled(false)
    setLoggedOut(true)
    if (router.canGoBack()) router.back()
    router.replace('/signin')
  }

  return logout
}

export default useLogout
