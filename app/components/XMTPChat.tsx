// ── BITROVE CHAT COMPONENT (app/components/XMTPChat.tsx) ──────
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { supabase } from '../../lib/supabase'

interface ChatProps {
  recipientAddress?: string
  recipientLabel?: string
  listingTitle?: string
  listingId?: string
  showDeleteButton?: boolean
  existingConversation?: any
}

interface Message {
  id: string
  content: string
  sender_address: string
  created_at: string
}

export default function BitroveChat({ recipientAddress, recipientLabel, listingTitle, listingId, showDeleteButton }: ChatProps) {
  const { address, isConnected } = useAccount()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getConversationId = () => {
    if (!address || !recipientAddress) return null
    const sorted = [address.toLowerCase(), recipientAddress.toLowerCase()].sort()
    return sorted.join('_')
  }

  const loadMessages = async () => {
    if (!address || !recipientAddress) return
    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(sender_address.eq.${address.toLowerCase()},recipient_address.eq.${recipientAddress.toLowerCase()}),and(sender_address.eq.${recipientAddress.toLowerCase()},recipient_address.eq.${address.toLowerCase()})`)
    if (listingId) query = query.eq('listing_id', listingId)
    const { data } = await query.order('created_at', { ascending: true })
    if (data) setMessages(data)

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('recipient_address', address.toLowerCase())
      .eq('sender_address', recipientAddress.toLowerCase())
      .eq('read', false)
  }

  useEffect(() => {
    if (open && address && recipientAddress) {
      setLoading(true)
      loadMessages().then(() => setLoading(false))
      intervalRef.current = setInterval(loadMessages, 3000)
      return () => clearInterval(intervalRef.current)
    }
  }, [open, address, recipientAddress])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !address || !recipientAddress) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert([{
      sender_address: address.toLowerCase(),
      recipient_address: recipientAddress.toLowerCase(),
      content,
      listing_id: listingId || null,
      read: false,
    }])
    await loadMessages()
    setSending(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return
    if (!address || !recipientAddress) return
    await supabase
      .from('messages')
      .delete()
      .or(`and(sender_address.eq.${address.toLowerCase()},recipient_address.eq.${recipientAddress.toLowerCase()}),and(sender_address.eq.${recipientAddress.toLowerCase()},recipient_address.eq.${address.toLowerCase()})`)
    setMessages([])
    setDeleted(true)
    setOpen(false)
  }

  const isMine = (senderAddress: string) => {
    return senderAddress.toLowerCase() === address?.toLowerCase()
  }

  const displayLabel = recipientLabel || (recipientAddress ? `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}` : 'Chat')

  if (deleted) {
    return (
      <div className="mb-4 rounded-xl p-4 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
        <p className="text-xs" style={{ color: '#8B8B9E' }}>Conversation deleted.</p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2"
        style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
      >
        💬 Chat with {recipientAddress ? `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}` : 'Seller'}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', height: '80vh', maxHeight: '600px' }}>

            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2A2A3A' }}>
              <div>
                <p className="text-white font-semibold text-sm">{displayLabel}</p>
                {listingTitle && <p className="text-xs" style={{ color: '#8B8B9E' }}>{listingTitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7931A22', border: '1px solid #F7931A', color: '#F7931A' }}>
                  🔒 Secure
                </span>
                {showDeleteButton && messages.length > 0 && (
                  <button onClick={handleDelete} className="text-xs px-2 py-1 rounded" style={{ color: '#ff4444', border: '1px solid #ff4444', background: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ color: '#8B8B9E', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
            </div>

            {!isConnected && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-white font-semibold mb-2">Connect your wallet to chat</p>
                  <ConnectButton />
                </div>
              </div>
            )}

            {isConnected && loading && (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: '#8B8B9E' }}>Loading messages...</p>
              </div>
            )}

            {isConnected && !loading && (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs" style={{ color: '#8B8B9E' }}>No messages yet. Say hello!</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${isMine(msg.sender_address) ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-xs px-4 py-2 rounded-2xl text-sm"
                        style={{
                          backgroundColor: isMine(msg.sender_address) ? '#F7931A' : '#0A0A0F',
                          color: '#fff',
                          border: isMine(msg.sender_address) ? 'none' : '1px solid #2A2A3A',
                        }}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
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
