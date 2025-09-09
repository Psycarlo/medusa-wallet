import BottomSheet from '@gorhom/bottom-sheet'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { toast } from 'sonner-native'
import { useShallow } from 'zustand/react/shallow'

import lnbits from '@/api/lnbits'
import MButton from '@/components/MButton'
import MText from '@/components/MText'
import MTextInput from '@/components/MTextInput'
import LnbitsUrl from '@/components/sheets/LnbitsUrl'
import MCenter from '@/layouts/MCenter'
import MFormLayout from '@/layouts/MFormLayout'
import MHStack from '@/layouts/MHStack'
import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { useAuthStore } from '@/store/auth'

export default function Signin() {
  const router = useRouter()
  const [setFirstTime, setLoggedOut, setAccessToken] = useAuthStore(
    useShallow((state) => [
      state.setFirstTime,
      state.setLoggedOut,
      state.setAccessToken
    ])
  )

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const bottomSheetLnbitsUrlRef = useRef<BottomSheet>(null)
  const handleBottomSheetLnbitsUrlOpen = () =>
    bottomSheetLnbitsUrlRef.current?.expand()

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: () => lnbits.login(identifier, password),
    onSuccess: (accessToken) => {
      if (!accessToken) return
      setAccessToken(accessToken)
      setFirstTime(false)
      setLoggedOut(false)
      router.replace('/')
    },
    onError: (error) => {
      // TODO: i18n errors
      toast.error(error.message)
    }
  })

  return (
    <>
      <MMainLayout>
        <MCenter>
          <MVStack gap="2xl">
            <MVStack gap="md">
              <MVStack gap="none">
                <MText weight="bold" size="4xl" center>
                  {t('signinTitle1')}
                </MText>
                <MText color="bitcoin" weight="bold" size="4xl" center>
                  {t('signinTitle2')}
                </MText>
              </MVStack>
              <MVStack gap="none">
                <MText color="muted" center>
                  {t('signinDescription1')}
                </MText>
                <MText color="muted" center>
                  {t('signinDescription2')}
                </MText>
              </MVStack>
            </MVStack>
            <MFormLayout>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('identifier')} />
                <MTextInput
                  value={identifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('enterIdentifier')}
                  onChangeText={(text) => setIdentifier(text)}
                  onBlur={() => setIdentifier(identifier.trim())}
                />
              </MFormLayout.Item>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('password')} />
                <MTextInput
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder={t('enterAPassword')}
                  onChangeText={(text) => setPassword(text)}
                />
              </MFormLayout.Item>
              <MFormLayout.Item>
                <MHStack justifyBetween style={{ paddingHorizontal: 8 }}>
                  <MText color="muted" size="sm">
                    {t('dontHaveAnAccount')}
                  </MText>
                  <MText
                    color="bitcoin"
                    size="sm"
                    weight="medium"
                    center
                    onPress={() => router.navigate('/signup')}
                  >
                    {t('signUp')}
                  </MText>
                </MHStack>
              </MFormLayout.Item>
            </MFormLayout>
            <MButton
              text={t('signIn')}
              loading={loginMutation.isPending}
              onPress={() => loginMutation.mutate()}
            />
            <MVStack gap="none">
              <MText color="muted" size="sm" center>
                {t('changeLnbitsUrlQuestion')}
              </MText>
              <MText
                color="bitcoin"
                size="sm"
                weight="medium"
                center
                onPress={handleBottomSheetLnbitsUrlOpen}
              >
                {t('changeLnbitsUrl')}
              </MText>
            </MVStack>
          </MVStack>
        </MCenter>
      </MMainLayout>
      <LnbitsUrl ref={bottomSheetLnbitsUrlRef} />
    </>
  )
}
