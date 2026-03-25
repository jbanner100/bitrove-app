// ── XMTP Context (app/contexts/XMTPContext.tsx) ─────────────────
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWalletClient } from 'wagmi'

interface XMTPContextType {
  xmtp: any | null
  loading: boolean
  unreadCount: number
  initXMTP: () => Promise<void>
}

const XMTPContext = createContext<XMTPContextType>({
  xmtp: null,
  loading: false,
  unreadCount: 0,
  initXMTP: async () => {},
})

export function XMTPProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient()
  const [xmtp, setXmtp] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const initXMTP = async () => {
    if (!walletClient || xmtp) return
    setLoading(true)
    try {
      const { Client, IdentifierKind } = await import('@xmtp/browser-sdk')

      const address = walletClient.account.address

      const signer = {
        type: 'EOA' as const,
        getIdentifier: () => ({
          identifier: address.toLowerCase(),
          identifierKind: IdentifierKind.Ethereum,
        }),
        signMessage: async (message: string): Promise<Uint8Array> => {
          const sig = await walletClient.signMessage({ message })
          // Convert hex signature to Uint8Array
          const hex = sig.startsWith('0x') ? sig.slice(2) : sig
          const bytes = new Uint8Array(hex.length / 2)
          for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
          }
          return bytes
        },
      }

      const client = await Client.create(signer)

      setXmtp(client)
      const conversations = await client.conversations.list()
      setUnreadCount(conversations.length)
    } catch (e) {
      console.error('XMTP init failed:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (walletClient && !xmtp) {
      initXMTP()
    }
  }, [walletClient])

  return (
    <XMTPContext.Provider value={{ xmtp, loading, unreadCount, initXMTP }}>
      {children}
    </XMTPContext.Provider>
  )
}

export const useXMTP = () => useContext(XMTPContext)
