import * as LocalAuthentication from 'expo-local-authentication'

function useRequestLocalAuthentication() {
  async function requestLocalAuthentication() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.getEnrolledLevelAsync()
    const supportedAuthenticationTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync()

    console.log(hasHardware, enrolled, supportedAuthenticationTypes)

    // const biometricAuth = await LocalAuthentication.authenticateAsync({
    //   promptMessage: 'Medusa Authentication',
    //   cancelLabel: 'Cancel',
    //   biometricsSecurityLevel: 'strong'
    // })
  }

  return requestLocalAuthentication
}
