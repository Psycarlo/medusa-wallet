import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet'
import { type BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { type ForwardedRef, forwardRef, useCallback } from 'react'

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
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  )

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: Colors.grayDarkest }}
      handleStyle={{ display: 'none' }}
      onClose={onClose}
    >
      <BottomSheetScrollView
        style={{
          flex: 1,
          paddingTop: 16,
          paddingHorizontal: mainLayoutPaddingHorizontal
        }}
      >
        <MVStack gap="lg">
          <MHStack style={{ justifyContent: 'space-between' }}>
            <MIconButton onPress={() => (ref as any)?.current?.close()}>
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
    </BottomSheet>
  )
}

export default forwardRef(MBottomSheet)
