import { Image } from 'expo-image'

import MMainLayout from '@/layouts/MMainLayout'
import MVStack from '@/layouts/MVStack'

export default function Privacy() {
  return (
    <MMainLayout>
      <MVStack itemsCenter style={{ justifyContent: 'center', height: '100%' }}>
        <Image
          source={require('@/assets/images/medusa-logo-large.png')}
          style={{ width: 80, height: 80 }}
        />
      </MVStack>
    </MMainLayout>
  )
}
