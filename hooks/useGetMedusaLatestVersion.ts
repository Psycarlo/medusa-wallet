import { useQuery } from '@tanstack/react-query'

import github from '@/api/github'

function useGetMedusaLatestVersion() {
  return useQuery({
    queryKey: ['medusaRelease'],
    queryFn: () => github.getMedusaLatestRelease(),
    // Once per app session: GitHub rate limits unauthenticated requests
    staleTime: Infinity,
    retry: false
  })
}

export default useGetMedusaLatestVersion
