// ── XMTP Context (app/contexts/XMTPContext.tsx) ─────────────────
'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useWalletClient } from 'wagmi'

interface XMTPContextType {
  xmtp: any | null
  loading: boolean
  unreadCount: number
  initXMTP: () => Promise<void>
  markConversationRead: (conversationId: string) => void
  refreshUnread: () => Promise<void>
}

const XMTPContext = createContext<XMTPContextType>({
  xmtp: null,
  loading: false,
  unreadCount: 0,
  initXMTP: async () => {},
  markConversationRead: () => {},
  refreshUnread: async () => {},
})

const getLastRead = (wallet: string, convId: string): number => {
  try {
    return parseInt(localStorage.getItem(`xmtp_read_${wallet}_${convId}`) || '0', 10)
  } catch { return 0 }
}

const setLastRead = (wallet: string, convId: string) => {
  try {
    localStorage.setItem(`xmtp_read_${wallet}_${convId}`, Date.now().toString())
  } catch {}
}

export function XMTPProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient()
  const [xmtp, setXmtp] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const computeUnread = useCallback(async (client: any, walletAddress: string) => {
    try {
      await client.conversations.sync()
      const conversations = await client.conversations.list()
      let count = 0
      for (const conv of conversations) {
        const lastRead = getLastRead(walletAddress, conv.id)
        const messages = await conv.messages({ limit: 1 })
        if (messages.length > 0) {
          const lastMsg = messages[0]
          const sentAtMs = typeof lastMsg.sentAtNs === 'bigint'
            ? Number(lastMsg.sentAtNs) / 1000000
            : lastMsg.sentAtNs / 1000000
          const isFromMe = lastMsg.senderInboxId === client.inboxId
          if (!isFromMe && sentAtMs > lastRead) count++
        }
      }
      setUnreadCount(count)
    } catch (e) {
      console.error('XMTP unread count failed:', e)
    }
  }, [])

  const initXMTP = useCallback(async () => {
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
      await computeUnread(client, address.toLowerCase())
      const streamMessages = async () => {
        try {
          const stream = await client.conversations.streamAllMessages()
          for await (const message of stream) {
            if (message.senderInboxId !== client.inboxId) {
              await computeUnread(client, address.toLowerCase())
            }
          }
        } catch (e) {
          console.error('XMTP stream error:', e)
        }
      }
      streamMessages()
    } catch (e) {
      console.error('XMTP init failed:', e)
    }
    setLoading(false)
  }, [walletClient, xmtp, computeUnread])

  const markConversationRead = useCallback((conversationId: string) => {
    if (!walletClient) return
    setLastRead(walletClient.account.address.toLowerCase(), conversationId)
    if (xmtp) computeUnread(xmtp, walletClient.account.address.toLowerCase())
  }, [walletClient, xmtp, computeUnread])

  const refreshUnread = useCallback(async () => {
    if (!xmtp || !walletClient) return
    await computeUnread(xmtp, walletClient.account.address.toLowerCase())
  }, [xmtp, walletClient, computeUnread])

  useEffect(() => {
    if (walletClient && !xmtp) {
      const key = `xmtp_registered_${walletClient.account.address.toLowerCase()}`
      const alreadyRegistered = localStorage.getItem(key)
      if (!alreadyRegistered) {
        initXMTP().then(() => {
          localStorage.setItem(key, '1')
        })
      } else {
        initXMTP()
      }
    }
  }, [walletClient])

  useEffect(() => {
    if (!walletClient) {
      setXmtp(null)
      setUnreadCount(0)
    }
  }, [walletClient])

  return (
    <XMTPContext.Provider value={{ xmtp, loading, unreadCount, initXMTP, markConversationRead, refreshUnread }}>
      {children}
    </XMTPContext.Provider>
  )
}

export const useXMTP = () => useContext(XMTPContext)
