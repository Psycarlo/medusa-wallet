import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import MButton from '@/components/MButton'
import MText from '@/components/MText'
import MCenter from '@/layouts/MCenter'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'

export default function Index() {
  const router = useRouter()

  return (
    <MCenter>
      <Image
        source={require('@/assets/images/medusa-logo-large.png')}
        style={{ width: 200, height: 200 }}
      />
      <MVStack gap="2xl">
        <MVStack gap="md">
          <MVStack gap="none">
            <MText weight="bold" size="4xl" center>
              {t('introTitle1')}
            </MText>
            <MText color="bitcoin" weight="bold" size="4xl" center>
              {t('introTitle2')}
            </MText>
          </MVStack>
          <MVStack gap="none">
            <MText color="muted" center>
              {t('introDescription1')}
            </MText>
            <MText color="muted" center>
              {t('introDescription2')}
            </MText>
          </MVStack>
        </MVStack>
        <MButton
          text={t('getStarted')}
          onPress={() => router.replace('/signup')}
        />
      </MVStack>
    </MCenter>
  )
}
