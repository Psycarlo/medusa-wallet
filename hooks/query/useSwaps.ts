import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'

function useSwaps(adminkey: string) {
  return useQuery({
    queryKey: ['swaps', adminkey],
    queryFn: async () => {
      const [normal, reverse] = await Promise.all([
        lnbits.listSwaps(adminkey),
        lnbits.listReverseSwaps(adminkey)
      ])

      // `direction` holds the amount option, so tag swaps by their type
      const ordered = [
        ...normal.map((swap) => ({ ...swap, type: 'in' as const })),
        ...reverse.map((swap) => ({ ...swap, type: 'out' as const }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      return ordered
    },
    enabled: true
  })
}

export default useSwaps
