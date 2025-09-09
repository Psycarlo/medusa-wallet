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

export default function Signup() {
  const router = useRouter()
  const [
    setFirstTime,
    setLoggedOut,
    setUsernameStore,
    setEmailStore,
    setAccessToken
  ] = useAuthStore(
    useShallow((state) => [
      state.setFirstTime,
      state.setLoggedOut,
      state.setUsername,
      state.setEmail,
      state.setAccessToken
    ])
  )

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const bottomSheetLnbitsUrlRef = useRef<BottomSheet>(null)
  const handleBottomSheetLnbitsUrlOpen = () =>
    bottomSheetLnbitsUrlRef.current?.expand()

  const registerMutation = useMutation({
    mutationKey: ['register'],
    mutationFn: () => lnbits.register(username, email, password),
    onSuccess: (accessToken) => {
      if (!accessToken) return
      setUsernameStore(username)
      setEmailStore(email)
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
                  {t('signupTitle1')}
                </MText>
                <MText color="bitcoin" weight="bold" size="4xl" center>
                  {t('signupTitle2')}
                </MText>
              </MVStack>
              <MVStack gap="none">
                <MText color="muted" center>
                  {t('signupDescription1')}
                </MText>
                <MText color="muted" center>
                  {t('signupDescription2')}
                </MText>
              </MVStack>
            </MVStack>
            <MFormLayout>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('username')} />
                <MTextInput
                  value={username}
                  autoCapitalize="none"
                  placeholder={t('enterAUsername')}
                  onChangeText={(text) => setUsername(text)}
                  onBlur={() => setUsername(username.trim())}
                />
              </MFormLayout.Item>
              <MFormLayout.Item>
                <MFormLayout.Label label={t('email')} />
                <MTextInput
                  value={email}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="yes"
                  inputMode="email"
                  placeholder={t('enterAnEmail')}
                  onChangeText={(text) => setEmail(text)}
                  onBlur={() => setEmail(email.trim())}
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
                    {t('alreadyHaveAnAccount')}
                  </MText>
                  <MText
                    color="bitcoin"
                    size="sm"
                    weight="medium"
                    center
                    onPress={() => router.navigate('/signin')}
                  >
                    {t('signIn')}
                  </MText>
                </MHStack>
              </MFormLayout.Item>
            </MFormLayout>
            <MButton
              text={t('signUp')}
              disabled={!username || !email || !password}
              loading={registerMutation.isPending}
              onPress={() => registerMutation.mutate()}
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
