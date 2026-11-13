export type WalletSearchParams = {
  id: string
}

export type InvoiceSearchParams = WalletSearchParams & {
  amount?: string
  memo?: string
}

export type SendSearchParams = WalletSearchParams & {
  invoice?: string
}

export type ReceiveSearchParams = {
  walletId?: string
}

export type CameraSearchParams = {
  walletId?: string
}

export type SendDetailsSearchParams = CameraSearchParams & {
  invoice: string
}

export type SendConfirmSearchParams = CameraSearchParams & {
  invoice: string
}

export type TransactionSearchParams = WalletSearchParams & {
  tid: string
}

export type NewPinParams = { backIcon?: 'true' }

/** What the PIN is being asked for (see the `validatePin` screen) */
export type ValidatePinPurpose =
  'disable-pin' | 'enable-biometric' | 'change-pin'

export type ValidatePinParams = { type?: ValidatePinPurpose }
