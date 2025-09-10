import { useQuery } from '@tanstack/react-query'

import github from '@/api/github'

function useGetMedusaLatestVersion() {
  return useQuery({
    queryKey: ['medusaRelease'],
    queryFn: () => github.getMedusaLatestRelease()
  })
}

export default useGetMedusaLatestVersion
