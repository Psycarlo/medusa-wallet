import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'

function useBoltzConfig() {
  return useQuery({
    queryKey: ['boltz-config'],
    queryFn: () => lnbits.getBoltzConfig()
  })
}

export default useBoltzConfig
