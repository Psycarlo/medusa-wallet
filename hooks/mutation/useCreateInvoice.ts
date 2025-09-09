import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner-native'

import lnbits from '@/api/lnbits'

function useCreateInvoice(inkey: string, amount: number, memo?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createInvoice'],
    mutationFn: () => lnbits.createInvoice(amount, inkey, memo),
    onSuccess: (response) => {
      if (!response) return
      lnbits.subscribePaymentWs(response.payment_hash, () => {
        toast.success(`+ ${response.amount} sats!`)
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        queryClient.invalidateQueries({ queryKey: ['paginated-payments'] })
      })
    }
  })
}

export default useCreateInvoice
