import MVStack from './MVStack'

type MPinLayoutProps = {
  children: React.ReactNode
}

export default function MPinLayout({ children }: MPinLayoutProps) {
  return (
    <MVStack
      justifyBetween
      style={{ paddingHorizontal: 32, paddingVertical: 32 }}
    >
      {children}
    </MVStack>
  )
}
