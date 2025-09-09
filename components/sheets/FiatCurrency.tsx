import { type BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef
} from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  fiatCurrencyDictionary,
  type SupportedFiatCurrencies
} from '@/config/fiat'
import { t } from '@/locales'
import { useSettingsStore } from '@/store/settings'
import fiatUtils from '@/utils/fiat'

import MBottomSheet from '../MBottomSheet'
import MSheetSelector from '../MSheetSelector'

function FiatCurrency(_: any, ref: ForwardedRef<BottomSheetMethods>) {
  const [fiatCurrency, setFiatCurrency] = useSettingsStore(
    useShallow((state) => [state.fiatCurrency, state.setFiatCurrency])
  )

  const bottomSheetRef = useRef<BottomSheetMethods>(null)

  // @ts-ignore
  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand()
  }))

  function handleSetFiatCurrency(fiat: SupportedFiatCurrencies) {
    setFiatCurrency(fiat)
    bottomSheetRef.current?.close()
  }

  return (
    <MBottomSheet
      ref={bottomSheetRef}
      title={t('selectFiatCurrency')}
      snapPoints={['58%']}
    >
      <MSheetSelector
        items={Object.keys(fiatCurrencyDictionary).map((key) => {
          const currencyKey = key as SupportedFiatCurrencies
          return {
            id: currencyKey,
            name: fiatUtils.getName(currencyKey),
            info1: fiatCurrencyDictionary[currencyKey].code,
            info2: fiatUtils.getSymbol(currencyKey)
          }
        })}
        selectedId={fiatCurrency}
        onSelect={(fiat) =>
          handleSetFiatCurrency(fiat as SupportedFiatCurrencies)
        }
      />
    </MBottomSheet>
  )
}

export default memo(forwardRef(FiatCurrency))
