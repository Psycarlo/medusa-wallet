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
  bitcoinUnitDictionary,
  type SupportedBitcoinUnits
} from '@/config/bitcoin'
import { t } from '@/locales'
import { useSettingsStore } from '@/store/settings'
import { useWalletsStore } from '@/store/wallets'

import MBottomSheet from '../MBottomSheet'
import MSheetSelector from '../MSheetSelector'

function BitcoinUnitSheet(_: any, ref: ForwardedRef<BottomSheetMethods>) {
  const totalBalance = useWalletsStore((state) => state.totalBalance)
  const [bitcoinUnit, setBitcoinUnit] = useSettingsStore(
    useShallow((state) => [state.bitcoinUnit, state.setBitcoinUnit])
  )

  const bottomSheetRef = useRef<BottomSheetMethods>(null)

  // @ts-ignore
  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand()
  }))

  function handleSetBitcoinUnit(unit: SupportedBitcoinUnits) {
    setBitcoinUnit(unit)
    bottomSheetRef.current?.close()
  }

  return (
    <MBottomSheet ref={bottomSheetRef} title={t('selectBitcoinUnit')}>
      <MSheetSelector
        items={Object.keys(bitcoinUnitDictionary).map((key) => {
          const unitKey = key as SupportedBitcoinUnits
          return {
            id: unitKey,
            name: bitcoinUnitDictionary[unitKey],
            info1: unitKey,
            info2:
              unitKey === 'sats'
                ? String(totalBalance)
                : String(totalBalance / 100_000_000)
          }
        })}
        selectedId={bitcoinUnit}
        onSelect={(unit) => handleSetBitcoinUnit(unit as SupportedBitcoinUnits)}
      />
    </MBottomSheet>
  )
}

export default memo(forwardRef(BitcoinUnitSheet))
