import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'

export const APP_VERSION = nativeApplicationVersion ?? '0.0.0'
export const BUILD_NUMBER = nativeBuildVersion ?? '0'
