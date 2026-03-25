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
      const { Client } = await import('@xmtp/browser-sdk')
      
      const signer = {
        getAddress: async () => walletClient.account.address,
        signMessage: async (message: string) => {
          return walletClient.signMessage({ message })
        },
      }

      const client = await Client.create(signer, {
        env: 'production'
      })
      
      setXmtp(client)

      // Check for unread conversations
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