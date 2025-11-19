import { StyleSheet } from 'react-native'

import MHStack from '@/layouts/MHStack'
import MVStack from '@/layouts/MVStack'
import { t } from '@/locales'
import { Colors } from '@/styles'
import { formatDateTime, formatNumber } from '@/utils/format'

import Inbound from './icons/Inbound'
import Outbound from './icons/Outbound'
import Wallet from './icons/Wallet'
import MButton from './MButton'
import MText from './MText'

type NormalSwapProps = {
  kind: 'normal'
  direction: 'in' | 'out'
  walletName: string
  amount: number
  expectedAmount: number
  createdAt: string
  count?: never
  status: string
  timeoutBlockHeight: number
}

type AutoSwapProps = {
  kind: 'auto'
  direction: 'out'
  walletName: string
  address: string
  amount: number
  expectedAmount?: never
  createdAt: string
  count: number
  status?: never
  timeoutBlockHeight?: never
}

type MSwapCardProps = (NormalSwapProps | AutoSwapProps) & { first?: boolean }

export default function MSwapCard({
  kind,
  direction,
  walletName,
  amount,
  expectedAmount,
  createdAt,
  count,
  status,
  timeoutBlockHeight,
  first
}: MSwapCardProps) {
  return (
    <MVStack style={[styles.cardBase, first ? { marginTop: 10 } : {}]}>
      {kind === 'auto' && (
        <MVStack itemsCenter style={styles.badgeBase}>
          <MText size="xs" style={{ color: Colors.dark }}>
            Auto
          </MText>
        </MVStack>
      )}
      <MHStack
        justifyBetween
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <MHStack style={{ flex: 1, justifyContent: 'flex-start' }}>
          <MVStack itemsCenter style={styles.iconBase}>
            {direction === 'in' ? <Inbound /> : <Outbound />}
          </MVStack>
          <MText>{direction === 'in' ? 'Onchain > LN' : 'LN > Onchain'}</MText>
        </MHStack>
        <MHStack style={{ flex: 1, justifyContent: 'flex-end' }}>
          <MText>{walletName}</MText>
          <MVStack itemsCenter style={styles.iconBase}>
            <Wallet />
          </MVStack>
        </MHStack>
      </MHStack>
      <MVStack gap="none">
        {kind === 'auto' && (
          <MHStack
            justifyBetween
            style={{ paddingHorizontal: 16, paddingVertical: 4 }}
          >
            <MText color="muted">{t('doneCount')}</MText>
            <MText weight="medium">
              {count === 1 ? t('1Time') : t('xTimes', { times: count })}
            </MText>
          </MHStack>
        )}
        {kind === 'normal' && (
          <MHStack
            justifyBetween
            style={{ paddingHorizontal: 16, paddingVertical: 4 }}
          >
            <MText color="muted">{t('status')}</MText>
            <MText weight="medium">{status}</MText>
          </MHStack>
        )}
        <MHStack
          justifyBetween
          style={{ paddingHorizontal: 16, paddingVertical: 4 }}
        >
          <MText color="muted">{t('amount')}</MText>
          <MText weight="medium">{formatNumber(amount)}</MText>
        </MHStack>
        {kind === 'normal' && (
          <MHStack
            justifyBetween
            style={{ paddingHorizontal: 16, paddingVertical: 4 }}
          >
            <MText color="muted">{t('expectedAmount')}</MText>
            <MText weight="medium">{formatNumber(expectedAmount)}</MText>
          </MHStack>
        )}
        {kind === 'normal' && (
          <MHStack
            justifyBetween
            style={{ paddingHorizontal: 16, paddingVertical: 4 }}
          >
            <MText color="muted">{t('timeoutBlockHeight')}</MText>
            <MText weight="medium">{timeoutBlockHeight}</MText>
          </MHStack>
        )}
        <MHStack
          justifyBetween
          style={{ paddingHorizontal: 16, paddingVertical: 4 }}
        >
          <MText color="muted">{t('createdAt')}</MText>
          <MText weight="medium">{formatDateTime(createdAt)}</MText>
        </MHStack>
      </MVStack>
      {kind === 'auto' ? (
        <MButton text={t('deleteAutoSwap')} variant="danger" />
      ) : (
        <MButton text={t('onchainDetails')} />
      )}
    </MVStack>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    marginBottom: 10,
    backgroundColor: Colors.grayDarkest,
    borderRadius: 8,
    paddingBottom: 16
  },
  badgeBase: {
    position: 'absolute',
    top: -10,
    transform: [{ translateX: -25 }],
    left: '50%',
    backgroundColor: Colors.bitcoin,
    width: 50,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: Colors.grayDarkest
  },
  iconBase: {
    width: 24,
    height: 24,
    backgroundColor: Colors.grayDarker,
    justifyContent: 'center',
    borderRadius: 4
  }
})
