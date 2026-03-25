// ── XMTP Chat Component (app/components/XMTPChat.tsx) ──────────
'use client'

import { useState, useEffect, useRef } from 'react'
import { useXMTP } from '../contexts/XMTPContext'
import { useAccount } from 'wagmi'

interface XMTPChatProps {
  recipientAddress: string
  recipientLabel?: string
  listingTitle?: string
}

interface Message {
  id: string
  content: string
  senderAddress: string
  sent: Date
}

export default function XMTPChat({ recipientAddress, recipientLabel, listingTitle }: XMTPChatProps) {
  const { xmtp, loading: xmtpLoading, initXMTP } = useXMTP()
  const { address, isConnected } = useAccount()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversation, setConversation] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [canMessage, setCanMessage] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const openChat = async () => {
    setOpen(true)
    if (!xmtp) {
      await initXMTP()
      return
    }
    await loadConversation()
  }

  const loadConversation = async () => {
    if (!xmtp || !recipientAddress) return
    setLoading(true)
    try {
      // Check if recipient can receive XMTP messages
      const canMsg = await xmtp.canMessage(recipientAddress)
      setCanMessage(canMsg)

      if (!canMsg) {
        setLoading(false)
        return
      }

      // Get or create conversation
      const convo = await xmtp.conversations.newConversation(recipientAddress)
      setConversation(convo)

      // Load existing messages
      const msgs = await convo.messages()
      setMessages(msgs.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderAddress: m.senderAddress,
        sent: m.sent,
      })))

      // Stream new messages
      const stream = await convo.streamMessages()
      for await (const msg of stream) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, {
            id: msg.id,
            content: msg.content,
            senderAddress: msg.senderAddress,
            sent: msg.sent,
          }]
        })
      }
    } catch (e) {
      console.error('Chat load failed:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (xmtp && open) {
      loadConversation()
    }
  }, [xmtp])

  const sendMessage = async () => {
    if (!conversation || !newMessage.trim() || sending) return
    setSending(true)
    try {
      await conversation.send(newMessage.trim())
      setNewMessage('')
    } catch (e) {
      console.error('Send failed:', e)
    }
    setSending(false)
  }

  const isMine = (senderAddress: string) => {
    return senderAddress?.toLowerCase() === address?.toLowerCase()
  }

  return (
    <div>
      {/* ── Chat Button ── */}
      <button
        onClick={openChat}
        className="w-full py-4 rounded-xl font-bold text-white text-lg mb-4 flex items-center justify-center gap-2"
        style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
      >
        💬 Chat Securely
      </button>

      {/* ── Chat Modal ── */}
      {open && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', height: '80vh', maxHeight: '600px' }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2A2A3A' }}>
              <div>
                <p className="text-white font-semibold text-sm">
                  {recipientLabel || `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`}
                </p>
                {listingTitle && (
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>{listingTitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#00D4AA22', border: '1px solid #00D4AA', color: '#00D4AA' }}>
                  🔒 XMTP Encrypted
                </span>
                <button onClick={() => setOpen(false)} style={{ color: '#8B8B9E' }}>✕</button>
              </div>
            </div>

            {/* ── Not connected ── */}
            {!isConnected && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-white font-semibold mb-2">Connect your wallet to chat</p>
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>Messages are encrypted end-to-end using XMTP</p>
                </div>
              </div>
            )}

            {/* ── XMTP loading ── */}
            {isConnected && (xmtpLoading || loading) && (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: '#8B8B9E' }}>Connecting to XMTP...</p>
              </div>
            )}

            {/* ── Recipient cant receive messages ── */}
            {isConnected && !xmtpLoading && !loading && canMessage === false && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-white font-semibold mb-2">Seller not yet on XMTP</p>
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>The seller needs to enable XMTP messaging by connecting their wallet to Bitrove first.</p>
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            {isConnected && !xmtpLoading && !loading && canMessage === true && (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs" style={{ color: '#8B8B9E' }}>No messages yet. Say hello!</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${isMine(msg.senderAddress) ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-xs px-4 py-2 rounded-2xl text-sm"
                        style={{
                          backgroundColor: isMine(msg.senderAddress) ? '#F7931A' : '#0A0A0F',
                          color: '#fff',
                          border: isMine(msg.senderAddress) ? 'none' : '1px solid #2A2A3A',
                        }}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.sent).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Input ── */}
                <div className="p-4 border-t flex gap-2" style={{ borderColor: '#2A2A3A' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2 rounded-lg text-white outline-none text-sm"
                    style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
                    style={{ backgroundColor: sending ? '#2A2A3A' : '#F7931A' }}
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}