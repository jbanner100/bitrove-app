// ── XMTP Chat Component (app/components/XMTPChat.tsx) ──────────
'use client'

import { useState, useEffect, useRef } from 'react'
import { useXMTP } from '../contexts/XMTPContext'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

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
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async () => {
    setOpen(true)
    if (isConnected && !xmtp) {
      await initXMTP()
    }
  }

  const loadConversation = async () => {
    if (!xmtp || !recipientAddress) return
    setLoading(true)
    setError('')
    try {
      const convo = await xmtp.conversations.newDm(recipientAddress)
      setConversation(convo)
      const msgs = await convo.messages()
      setMessages(msgs.map((m: any) => ({
        id: m.id,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        senderAddress: m.senderInboxId,
        sent: new Date(Number(m.sentAtNs) / 1000000),
      })))
    } catch (e: any) {
      console.error('Chat load failed:', e)
      setError('Could not load chat. Seller may not be on XMTP yet.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (xmtp && open) {
      loadConversation()
    }
  }, [xmtp, open])

  const sendMessage = async () => {
    if (!conversation || !newMessage.trim() || sending) return
    setSending(true)
    try {
      await conversation.send(newMessage.trim())
      setNewMessage('')
      await loadConversation()
    } catch (e) {
      console.error('Send failed:', e)
    }
    setSending(false)
  }

  const isMine = (senderInboxId: string) => {
    return xmtp?.inboxId === senderInboxId
  }

  const showLoading = isConnected && (xmtpLoading || loading)
  const showError = isConnected && !xmtpLoading && !loading && error
  const showMessages = isConnected && !xmtpLoading && !loading && !error && conversation
  const showWaiting = isConnected && !xmtpLoading && !loading && !error && !conversation

  return (
    <div className="mb-4">
      <button
        onClick={openChat}
        className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2"
        style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
      >
        💬 Chat Securely
      </button>

      {open && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', height: '80vh', maxHeight: '600px' }}>

            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2A2A3A' }}>
              <div>
                <p className="text-white font-semibold text-sm">
                  {recipientLabel || `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`}
                </p>
                {listingTitle && <p className="text-xs" style={{ color: '#8B8B9E' }}>{listingTitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#00D4AA22', border: '1px solid #00D4AA', color: '#00D4AA' }}>
                  🔒 XMTP Encrypted
                </span>
                <button onClick={() => { setOpen(false); setConversation(null); setMessages([]); setError('') }} style={{ color: '#8B8B9E' }}>✕</button>
              </div>
            </div>

            {!isConnected && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-white font-semibold mb-2">Connect your wallet to chat</p>
                  <p className="text-xs mb-4" style={{ color: '#8B8B9E' }}>Messages are encrypted end-to-end using XMTP</p>
                  <ConnectButton />
                </div>
              </div>
            )}

            {showLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white mb-2">Connecting to XMTP...</p>
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>Check MetaMask for a signature request</p>
                </div>
              </div>
            )}

            {showWaiting && (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: '#8B8B9E' }}>Setting up chat...</p>
              </div>
            )}

            {showError && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-white font-semibold mb-2">Chat unavailable</p>
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>{error}</p>
                </div>
              </div>
            )}

            {showMessages && (
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
                          {msg.sent.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

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
