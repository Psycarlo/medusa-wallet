import { useInfiniteQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'
import { PAYMENTS_PER_FETCH } from '@/config/payments'

function usePaginatedPayments(inkey: string, enabled: boolean) {
  async function fetchPaginatedPayments({ pageParam = 0 }) {
    return lnbits.getPaginatedPayments(inkey, {
      offset: pageParam * PAYMENTS_PER_FETCH
    }) // TODO: fix return
  }

  return useInfiniteQuery({
    queryKey: ['paginated-payments'],
    queryFn: fetchPaginatedPayments,
    initialPageParam: 0,
    getNextPageParam: (_, __, lastPageParam) => lastPageParam + 1,
    enabled
  })
}

export default usePaginatedPayments
