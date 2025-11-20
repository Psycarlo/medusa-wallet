import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import lnbits, { type CreateSwapData } from '@/api/lnbits'
import { t } from '@/locales'

function useCreateSwap(adminkey: string) {
  const router = useRouter()

  return useMutation({
    mutationKey: ['createSwap'],
    mutationFn: (data: CreateSwapData) => lnbits.createSwap(data, adminkey),
    onSuccess: () => {
      toast.success(t('createdSwap'))
      router.navigate('/swaps')
    },
    onError: () => {
      toast.error(t('errorCreateSwap'))
    }
  })
}

export default useCreateSwap
