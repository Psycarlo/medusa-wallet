import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import lnbits, { type CreateSwapData } from '@/api/lnbits'

function useCreateSwap(adminkey: string) {
  const router = useRouter()

  return useMutation({
    mutationKey: ['createSwap'],
    mutationFn: (data: CreateSwapData) => lnbits.createSwap(data, adminkey),
    onSuccess: () => {
      toast.success('Swap created!') // Change
      router.navigate('/swaps')
    }
  })
}

export default useCreateSwap
