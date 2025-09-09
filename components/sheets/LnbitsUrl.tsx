import { type BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
  useState
} from 'react'

import useTrySetLnbitsUrl from '@/hooks/useTrySetLnbitsUrl'
import { t } from '@/locales'
import { useSettingsStore } from '@/store/settings'

import MBottomSheet from '../MBottomSheet'
import MButton from '../MButton'
import MTextInput from '../MTextInput'

function LnbitsUrlSheet(_: any, ref: ForwardedRef<BottomSheetMethods>) {
  const lnbitsUrl = useSettingsStore((state) => state.lnbitsUrl)
  const { trySetLnbitsUrl, loading } = useTrySetLnbitsUrl()

  const bottomSheetRef = useRef<BottomSheetMethods>(null)

  const [localLnbitsUrl, setLocalLnbitsUrl] = useState(lnbitsUrl)

  // @ts-ignore
  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand()
  }))

  return (
    <MBottomSheet
      ref={bottomSheetRef}
      title={t('changeLnbitsUrl')}
      onClose={() => setLocalLnbitsUrl(lnbitsUrl)}
    >
      <MTextInput
        autoCapitalize="none"
        keyboardType="url"
        value={localLnbitsUrl}
        onChangeText={setLocalLnbitsUrl}
      />
      <MButton
        text={t('save')}
        loading={loading}
        onPress={() => trySetLnbitsUrl(localLnbitsUrl)}
      />
    </MBottomSheet>
  )
}

export default memo(forwardRef(LnbitsUrlSheet))
