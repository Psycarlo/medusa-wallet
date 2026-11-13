import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import lnbits, { type CreateSwapData } from '@/api/lnbits'
import { t } from '@/locales'

function useCreateSwap(adminkey: string) {
  const router = useRouter()

  return useMutation({
    mutationKey: ['createSwap'],
    // Never queue a payment while offline to run it later
    networkMode: 'always',
    mutationFn: (data: CreateSwapData) => lnbits.createSwap(data, adminkey),
    onSuccess: () => {
      toast.success(t('createdSwap'))
      router.navigate('/swaps')
    },
    onError: (error) => {
      toast.error(t('errorCreateSwap'), { description: error.message })
    }
  })
}

export default useCreateSwap
