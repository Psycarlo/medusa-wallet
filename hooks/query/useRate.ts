import { useQuery } from '@tanstack/react-query'

import lnbits from '@/api/lnbits'
import { useSettingsStore } from '@/store/settings'

function useRate() {
  const fiatCurrency = useSettingsStore((state) => state.fiatCurrency)
  return useQuery({
    queryKey: ['rate', fiatCurrency],
    queryFn: () => lnbits.rate(fiatCurrency),
    enabled: !!fiatCurrency
  })
}

export default useRate
