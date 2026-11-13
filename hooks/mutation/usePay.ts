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
    // Never queue a payment while offline to run it later
    networkMode: 'always',
    mutationFn: (invoice: PayData) => lnbits.pay(invoice, adminkey),
    onSuccess: (payment) => {
      // LNbits returns slow payments (e.g. hold invoices) while still pending
      if (payment?.status === 'pending') toast.info(t('pendingPayment'))
      else toast.success(t('successPayment'))
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
