import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'

function useAutoSwaps(adminkey: string) {
  return useQuery({
    queryKey: ['autoSwaps', adminkey],
    queryFn: () => lnbits.listAutoReverseSwaps(adminkey),
    enabled: true
  })
}

export default useAutoSwaps
