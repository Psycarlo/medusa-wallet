import { useInfiniteQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'
import { PAYMENTS_PER_FETCH } from '@/config/payments'

function usePaginatedPayments(accessToken: string, enabled: boolean) {
  async function fetchPaginatedPayments({ pageParam = 0 }) {
    const { transactions } = await lnbits.getAllPaginatedPayments(accessToken, {
      offset: pageParam * PAYMENTS_PER_FETCH
    })
    return transactions
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
