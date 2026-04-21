import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import { PAYMENTS_PER_FETCH } from '@/config/payments'
import { useFiatStore } from '@/store/fiat'

function usePayments(accessToken: string, enabled: boolean) {
  const [snapshots, addSnapshot] = useFiatStore(
    useShallow((state) => [state.snapshots, state.addSnapshot])
  )

  return useQuery({
    queryKey: ['payments', accessToken],
    queryFn: async () => {
      const { transactions, newSnapshots } =
        await lnbits.getAllPaginatedPayments(
          accessToken,
          { limit: PAYMENTS_PER_FETCH * 2 },
          snapshots
        )

      for (const [timestamp, snapshot] of Object.entries(newSnapshots)) {
        addSnapshot(timestamp, snapshot)
      }

      return transactions
    },
    enabled
  })
}

export default usePayments
