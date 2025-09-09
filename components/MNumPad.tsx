import * as LocalAuthentication from 'expo-local-authentication'
import { memo, useEffect, useState } from 'react'
import { View } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { withHapticsImpact } from '@/utils/haptics'

import Delete from './icons/Delete'
import FaceId from './icons/FaceId'
import Fingerprint from './icons/Fingerprint'
import MIconButton from './MIconButton'
import MText from './MText'

export type Keys =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 'DEL'
  | ','
  | 'BIOMETRIC'

type BiometricTypes = 'faceid' | 'fingerprint' | 'iris' | undefined

type MNumPadProps = {
  type?: 'btc' | 'fiat' | 'sats' | 'auth' | 'pin'
  onKeyPress: (key: Keys) => void
}

function MNumPad({ type = 'sats', onKeyPress }: MNumPadProps) {
  const [biometricType, setBiometricType] = useState<BiometricTypes>()

  useEffect(() => {
    async function getBiometricType() {
      if (type !== 'auth') return

      const supportedBiometricTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync()
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync()

      if (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK)
        return setBiometricType('faceid')
      else if (
        enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
      ) {
        if (
          supportedBiometricTypes.includes(
            LocalAuthentication.AuthenticationType.IRIS
          )
        )
          return setBiometricType('iris')

        if (
          supportedBiometricTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          )
        )
          return setBiometricType('fingerprint') // TODO: bug here for iPhones with TouchId?

        if (
          supportedBiometricTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        )
          return setBiometricType('faceid')
      }
    }

    getBiometricType()
  }, [type])

  return (
    <MVStack gap="xl">
      <MHStack justifyBetween>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(1))}
        >
          <MText size="xl" weight="semibold">
            1
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(2))}
        >
          <MText size="xl" weight="semibold">
            2
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(3))}
        >
          <MText size="xl" weight="semibold">
            3
          </MText>
        </MIconButton>
      </MHStack>
      <MHStack justifyBetween>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(4))}
        >
          <MText size="xl" weight="semibold">
            4
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(5))}
        >
          <MText size="xl" weight="semibold">
            5
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(6))}
        >
          <MText size="xl" weight="semibold">
            6
          </MText>
        </MIconButton>
      </MHStack>
      <MHStack justifyBetween>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(7))}
        >
          <MText size="xl" weight="semibold">
            7
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(8))}
        >
          <MText size="xl" weight="semibold">
            8
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(9))}
        >
          <MText size="xl" weight="semibold">
            9
          </MText>
        </MIconButton>
      </MHStack>
      <MHStack justifyBetween>
        {(type === 'sats' ||
          type === 'pin' ||
          (type === 'auth' && !biometricType)) && (
          <View style={{ width: 40, height: 40 }} />
        )}
        {(type === 'btc' || type === 'fiat') && (
          <MIconButton
            center
            style={{ width: 40, height: 40 }}
            onPress={() => withHapticsImpact(() => onKeyPress(','))}
          >
            <MText size="xl" weight="semibold">
              ,
            </MText>
          </MIconButton>
        )}
        {type === 'auth' && biometricType && (
          <MIconButton
            center
            style={{ width: 40, height: 40 }}
            onPress={() => withHapticsImpact(() => onKeyPress('BIOMETRIC'))}
          >
            {biometricType === 'fingerprint' ? <Fingerprint /> : <FaceId />}
          </MIconButton>
        )}
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress(0))}
        >
          <MText size="xl" weight="semibold">
            0
          </MText>
        </MIconButton>
        <MIconButton
          center
          style={{ width: 40, height: 40 }}
          onPress={() => withHapticsImpact(() => onKeyPress('DEL'))}
        >
          <Delete />
        </MIconButton>
      </MHStack>
    </MVStack>
  )
}

export default memo(MNumPad)
