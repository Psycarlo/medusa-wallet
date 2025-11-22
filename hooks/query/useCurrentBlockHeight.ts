import { useQuery } from '@tanstack/react-query'

import mempool from '@/api/mempool'

function useCurrentBlockHeight() {
  return useQuery({
    queryKey: ['block-height'],
    queryFn: async () => mempool.getCurrentBlockHeight(),
    enabled: true
  })
}

export default useCurrentBlockHeight
