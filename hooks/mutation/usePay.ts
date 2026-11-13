import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import lnbits, { type PayData } from '@/api/lnbits'
import { t } from '@/locales'

function usePay(adminkey: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['pay'],
    mutationFn: (invoice: PayData) => lnbits.pay(invoice, adminkey),
    onSuccess: () => {
      toast.success(t('successPayment'))
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      router.navigate('/')
    },
    onError: (error) => {
      toast.error(t('errorPayment'), { description: error.message })
      router.navigate('/')
    }
  })
}

export default usePay
