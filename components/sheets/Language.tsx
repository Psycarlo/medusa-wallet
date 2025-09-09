import { type BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef
} from 'react'
import { useShallow } from 'zustand/react/shallow'

import { languageDictionary, type SupportedLanguages } from '@/config/language'
import { t } from '@/locales'
import { useSettingsStore } from '@/store/settings'
import languageUtils from '@/utils/language'

import MBottomSheet from '../MBottomSheet'
import MSheetSelector from '../MSheetSelector'

function LanguageSheet(_: any, ref: ForwardedRef<BottomSheetMethods>) {
  const [language, setLanguage] = useSettingsStore(
    useShallow((state) => [state.language, state.setLanguage])
  )

  const bottomSheetRef = useRef<BottomSheetMethods>(null)

  // @ts-ignore
  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand()
  }))

  function handleSetLanguage(language: SupportedLanguages) {
    setLanguage(language)
    bottomSheetRef.current?.close()
  }

  return (
    <MBottomSheet ref={bottomSheetRef} title={t('selectAppLanguage')}>
      <MSheetSelector
        items={Object.keys(languageDictionary).map((key) => {
          const unitKey = key as SupportedLanguages
          return {
            id: unitKey,
            name: languageUtils.getName(unitKey),
            info1: languageDictionary[unitKey].code,
            info2: languageDictionary[unitKey].emoji
          }
        })}
        selectedId={language}
        onSelect={(language) =>
          handleSetLanguage(language as SupportedLanguages)
        }
      />
    </MBottomSheet>
  )
}

export default memo(forwardRef(LanguageSheet))
