// ── XMTP Context (app/contexts/XMTPContext.tsx) ─────────────────
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Client } from '@xmtp/xmtp-js'
import { useWalletClient } from 'wagmi'

interface XMTPContextType {
  xmtp: Client | null
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
  const [xmtp, setXmtp] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const initXMTP = async () => {
    if (!walletClient || xmtp) return
    setLoading(true)
    try {
      // Create XMTP client using the connected wallet
      const client = await Client.create(walletClient as any, {
        env: 'production'
      })
      setXmtp(client)

      // Check for unread messages
      const conversations = await client.conversations.list()
      let unread = 0
      for (const convo of conversations) {
        const messages = await convo.messages({ limit: 1 })
        if (messages.length > 0) {
          unread++
        }
      }
      setUnreadCount(unread)
    } catch (e) {
      console.error('XMTP init failed:', e)
    }
    setLoading(false)
  }

  // Auto-init when wallet connects
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