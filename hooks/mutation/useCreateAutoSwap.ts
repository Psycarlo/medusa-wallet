import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import lnbits, { type CreateAutoSwapData } from '@/api/lnbits'
import { t } from '@/locales'

function useCreateAutoSwap(adminkey: string) {
  const router = useRouter()

  return useMutation({
    mutationKey: ['createAutoSwap'],
    // Never queue a payment while offline to run it later
    networkMode: 'always',
    mutationFn: (data: CreateAutoSwapData) =>
      lnbits.createAutoSwap(data, adminkey),
    onSuccess: () => {
      toast.success(t('createdAutoSwap'))
      router.navigate('/swaps')
    },
    onError: (error) => {
      toast.error(t('errorCreateAutoSwap'), { description: error.message })
    }
  })
}

export default useCreateAutoSwap
