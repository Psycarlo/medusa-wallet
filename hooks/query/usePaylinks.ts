import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'

function usePaylinks(inkey: string, enabled: boolean) {
  return useQuery({
    queryKey: ['paylinks', inkey],
    queryFn: () => lnbits.getPaylinks(inkey),
    enabled
  })
}

export default usePaylinks
