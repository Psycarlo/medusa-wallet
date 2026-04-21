import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { type BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import {
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { Colors } from '@/styles'
import { mainLayoutPaddingHorizontal } from '@/styles/layout'

import Close from './icons/Close'
import MIconButton from './MIconButton'
import MText from './MText'

type MBottomSheetProps = {
  title: string
  snapPoints?: (string | number)[]
  onClose?: () => void
  children: React.ReactNode
}

function MBottomSheet(
  { title, snapPoints = ['50%'], onClose, children }: MBottomSheetProps,
  ref: ForwardedRef<BottomSheetMethods>
) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  // @ts-ignore
  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetModalRef.current?.present(),
    close: () => bottomSheetModalRef.current?.dismiss(),
    collapse: () => bottomSheetModalRef.current?.dismiss(),
    snapToIndex: (index: number) =>
      bottomSheetModalRef.current?.snapToIndex(index),
    snapToPosition: (position: string | number) =>
      bottomSheetModalRef.current?.snapToPosition(position),
    forceClose: () => bottomSheetModalRef.current?.dismiss()
  }))

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: Colors.grayDarkest }}
      handleStyle={{ display: 'none' }}
      onDismiss={onClose}
    >
      <BottomSheetScrollView
        style={{
          flex: 1,
          paddingTop: 16,
          paddingHorizontal: mainLayoutPaddingHorizontal
        }}
      >
        <MVStack gap="lg" style={{ paddingBottom: 48 }}>
          <MHStack style={{ justifyContent: 'space-between' }}>
            <MIconButton onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <Close />
            </MIconButton>
            <MText size="lg" weight="medium">
              {title}
            </MText>
            <MIconButton activeOpacity={0} style={{ opacity: 0 }}>
              <Close />
            </MIconButton>
          </MHStack>
          {children}
        </MVStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

export default forwardRef(MBottomSheet)
