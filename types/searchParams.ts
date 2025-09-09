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

export type ValidatePinParams = { type?: 'disable-pin' | 'enable-biometric' }
