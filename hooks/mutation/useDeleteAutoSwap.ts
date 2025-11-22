import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner-native'

import lnbits from '@/api/lnbits'
import { t } from '@/locales'

function useDeleteAutoSwap(adminkey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteAutoSwap'],
    mutationFn: (id: string) => lnbits.deleteAutoSwap(id, adminkey),
    onSuccess: () => {
      toast.success(t('deletedAutoSwap'))
      queryClient.invalidateQueries({ queryKey: ['autoSwaps'] })
    },
    onError: () => {
      toast.error(t('errorDeletingAutoSwap'))
    }
  })
}

export default useDeleteAutoSwap
