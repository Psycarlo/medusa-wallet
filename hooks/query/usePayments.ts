import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import { PAYMENTS_PER_FETCH } from '@/config/payments'
import { useFiatStore } from '@/store/fiat'

/**
 * WARNING: Does multiple calls
 * Refer to: https://github.com/lnbits/lnbits/issues/3123
 */
function usePayments(inkeys: string[], enabled: boolean) {
  const [snapshots, addSnapshot] = useFiatStore(
    useShallow((state) => [state.snapshots, state.addSnapshot])
  )

  return useQuery({
    queryKey: ['payments', inkeys],
    queryFn: async () => {
      if (!inkeys) return []
      const results = await Promise.all(
        inkeys.map((inkey) =>
          lnbits.getPaginatedPayments(
            inkey,
            { limit: PAYMENTS_PER_FETCH * 2 },
            snapshots
          )
        )
      )

      for (const { newSnapshots } of results) {
        for (const [timestamp, snapshot] of Object.entries(newSnapshots)) {
          addSnapshot(timestamp, snapshot)
        }
      }

      return results.map(({ transactions }) => transactions)
    },
    enabled
  })
}

export default usePayments
