import * as Clipboard from 'expo-clipboard'
import { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated'

import { t } from '@/locales'
import { Colors } from '@/styles'

import MText from './MText'

const logo = require('@/assets/images/medusa-logo.png')

type SSQRCodeProps = {
  value: string
  size?: number
  ecl?: 'H' | 'Q' | 'M' | 'L'
  loading?: boolean
  placeholder?: boolean
}

export default function MQRCode({
  value,
  size = 280,
  ecl = 'M',
  loading,
  placeholder
}: SSQRCodeProps) {
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  async function handleClick() {
    if (!value || loading) return
    await Clipboard.setStringAsync(value)
  }

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: 1000,
        easing: Easing.linear
      }),
      -1,
      true
    )

    return () => {
      cancelAnimation(opacity)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleClick}>
      {!loading && value ? (
        <QRCode
          value={value}
          logo={logo}
          logoBorderRadius={8}
          logoBackgroundColor={Colors.dark}
          size={size}
          color={Colors.white}
          backgroundColor={Colors.dark}
          ecl={ecl}
        />
      ) : loading ? (
        <Animated.View
          style={[
            { height: size, width: size, backgroundColor: Colors.grayDarker },
            animatedStyle
          ]}
        />
      ) : placeholder ? (
        <View
          style={{
            height: size,
            width: size,
            backgroundColor: Colors.grayDarkest,
            position: 'relative',
            justifyContent: 'center'
          }}
        >
          <MText
            color="muted"
            center
            style={{ maxWidth: 180, alignSelf: 'center' }}
          >
            {t('addAmountToGenerate')}
          </MText>
          <View
            style={{
              height: 20,
              width: 20,
              position: 'absolute',
              top: 20,
              left: 20,
              backgroundColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              borderWidth: 10,
              position: 'absolute',
              top: 0,
              left: 0,
              borderColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 20,
              width: 20,
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              borderWidth: 10,
              position: 'absolute',
              top: 0,
              right: 0,
              borderColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 20,
              width: 20,
              position: 'absolute',
              bottom: 20,
              left: 20,
              backgroundColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              borderWidth: 10,
              position: 'absolute',
              bottom: 0,
              left: 0,
              borderColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 20,
              width: 20,
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: Colors.grayDarker
            }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              borderWidth: 10,
              position: 'absolute',
              bottom: 0,
              right: 0,
              borderColor: Colors.grayDarker
            }}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  )
}
