import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'

function useUser(accessToken: string) {
  return useQuery({
    queryKey: ['user', accessToken],
    queryFn: () => lnbits.getUser(accessToken),
    enabled: !!accessToken
  })
}

export default useUser
