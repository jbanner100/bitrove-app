// ── BITROVE MY TRADES PAGE (app/trades/page.tsx) ───────────────
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '../../lib/supabase'
import XMTPChat from '../../app/components/XMTPChat'

const statusConfig: Record<string, { label: string, color: string }> = {
  funded:   { label: 'In Escrow', color: '#F7931A' },
  complete: { label: 'Complete',  color: '#00D4AA' },
  disputed: { label: 'Disputed',  color: '#ff4444' },
  refunded: { label: 'Refunded',  color: '#8B8B9E' },
}

const tokenConfig: Record<string, { symbol: string, color: string }> = {
  BTC:  { symbol: '₿', color: '#F7931A' },
  ETH:  { symbol: 'Ξ', color: '#8B8B9E' },
  USDT: { symbol: '◈', color: '#00D4AA' },
}

export default function TradesPage() {
  // Early access guard
  useEffect(() => {
    const access = localStorage.getItem('bitrove_access')
    if (access !== 'granted') {
      window.location.href = '/'
    }
  }, [])

  const { address, isConnected } = useAccount()
  const [buyerTrades, setBuyerTrades] = useState<any[]>([])
  const [sellerTrades, setSellerTrades] = useState<any[]>([])
  const [sellerListings, setSellerListings] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [selectedConvo, setSelectedConvo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'buying' | 'selling' | 'chats'>('buying')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!address) return
    const fetchTrades = async () => {
      setLoading(true)
      const { data: buying } = await supabase
        .from('trades')
        .select('*, listings(*)')
        .eq('buyer_address', address)
        .order('created_at', { ascending: false })
      const { data: selling } = await supabase
        .from('trades')
        .select('*, listings(*)')
        .eq('seller_address', address)
        .order('created_at', { ascending: false })
      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_address', address)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (buying) setBuyerTrades(buying)
      if (selling) setSellerTrades(selling)
      if (listings) setSellerListings(listings)
      setLoading(false)
    }
    fetchTrades()
  }, [address])

  useEffect(() => {
    if (activeTab === 'chats' && address) {
      loadConversations()
    }
  }, [activeTab, address])

  const loadConversations = async () => {
    if (!address) return
    setLoadingChats(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_address.eq.${address.toLowerCase()},recipient_address.eq.${address.toLowerCase()}`)
        .order('created_at', { ascending: false })
      
      // Group by conversation partner + listing
      const convMap: Record<string, any> = {}
      if (data) {
        data.forEach(msg => {
          const partner = msg.sender_address === address.toLowerCase()
            ? msg.recipient_address
            : msg.sender_address
          const key = `${partner}_${msg.listing_id || 'general'}`
          if (!convMap[key]) {
            convMap[key] = { partnerAddress: partner, listingId: msg.listing_id, listingTitle: null, listingPhoto: null, lastMessage: msg.content, lastTime: msg.created_at, unread: 0 }
          }
          if (msg.recipient_address === address.toLowerCase() && !msg.read) {
            convMap[key].unread++
          }
        })
      }
      // Fetch listing titles and photos
      const listingIds = [...new Set(Object.values(convMap).map((c: any) => c.listingId).filter(Boolean))]
      if (listingIds.length > 0) {
        const { data: listings } = await supabase.from('listings').select('id, title, photos').in('id', listingIds)
        if (listings) {
          listings.forEach((l: any) => {
            Object.values(convMap).forEach((c: any) => {
              if (c.listingId === l.id) {
                c.listingTitle = l.title
                c.listingPhoto = l.photos?.[0] || null
              }
            })
          })
        }
      }
      setConversations(Object.values(convMap))
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
    setLoadingChats(false)
  }

  const TradeCard = ({ trade, isBuyer }: { trade: any, isBuyer: boolean }) => {
    const token = tokenConfig[trade.token] || tokenConfig.BTC
    const status = statusConfig[trade.status] || statusConfig.funded
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold mb-1">{trade.listings?.title || 'Item'}</h3>
            <p className="text-xs" style={{ color: '#8B8B9E' }}>
              {isBuyer ? 'Seller' : 'Buyer'}: {isBuyer ? trade.seller_address?.slice(0, 6) : trade.buyer_address?.slice(0, 6)}...{isBuyer ? trade.seller_address?.slice(-4) : trade.buyer_address?.slice(-4)}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${status.color}22`, border: `1px solid ${status.color}`, color: status.color }}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Amount</p>
            <p className="font-bold" style={{ color: token.color }}>{token.symbol} {trade.crypto_amount?.toFixed(6)}</p>
            <p className="text-xs" style={{ color: '#8B8B9E' }}>≈ ${trade.aud_price?.toLocaleString()} AUD</p>
          </div>
          <p className="text-xs" style={{ color: '#8B8B9E' }}>{new Date(trade.created_at).toLocaleDateString('en-AU')}</p>
        </div>
        <button
          onClick={() => window.location.href = `/trades/${trade.id}`}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#F7931A' }}
        >
          View Trade Details
        </button>
      </div>
    )
  }

  const ConvoCard = ({ convo }: { convo: any }) => {
    return (
      <div
        className="rounded-xl p-4 cursor-pointer flex gap-4 items-center"
        style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
        onClick={() => setSelectedConvo(convo)}
      >
        {/* Listing photo thumbnail */}
        <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 64, height: 64, backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
          {convo.listingPhoto ? (
            <img src={convo.listingPhoto} alt={convo.listingTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 28 }}>📦</div>
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          {convo.listingTitle && <p className="text-white font-semibold text-sm mb-1 truncate">{convo.listingTitle}</p>}
          <p className="text-xs mb-1 truncate" style={{ color: '#8B8B9E' }}>{convo.lastMessage?.slice(0, 60)}{convo.lastMessage?.length > 60 ? '...' : ''}</p>
          <p className="text-xs" style={{ color: '#8B8B9E' }}>With: {convo.partnerAddress.slice(0, 6)}...{convo.partnerAddress.slice(-4)}</p>
        </div>

        {/* Unread badge */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {convo.unread > 0 && (
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ backgroundColor: '#F7931A', color: '#fff' }}>
              {convo.unread}
            </span>
          )}
          <span style={{ color: '#8B8B9E', fontSize: 18 }}>›</span>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <a href="/browse" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
          <a href="/browse" className="text-sm" style={{ color: '#8B8B9E' }}>← Back to listings</a>
        </div>
        <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">My Trades</h1>

        {!isConnected ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <p className="text-white font-semibold mb-4">Connect your wallet to view your trades</p>
            <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('buying')}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: activeTab === 'buying' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'buying' ? '#fff' : '#8B8B9E' }}
              >
                🛒 Buying ({buyerTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('selling')}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: activeTab === 'selling' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'selling' ? '#fff' : '#8B8B9E' }}
              >
                📦 Selling ({sellerListings.length + sellerTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: activeTab === 'chats' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'chats' ? '#fff' : '#8B8B9E' }}
              >
                💬 My Chats
              </button>
            </div>

            {loading && activeTab !== 'chats' ? (
              <div className="text-center py-16"><p style={{ color: '#8B8B9E' }}>Loading trades...</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeTab === 'buying' && (
                  buyerTrades.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-2xl mb-4">🛒</p>
                      <p className="text-white font-semibold mb-2">No purchases yet</p>
                      <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Browse the marketplace and make your first purchase</p>
                      <button onClick={() => window.location.href = '/browse'} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Browse Listings</button>
                    </div>
                  ) : buyerTrades.map(trade => <TradeCard key={trade.id} trade={trade} isBuyer={true} />)
                )}

                {activeTab === 'selling' && (
                  sellerListings.length === 0 && sellerTrades.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-2xl mb-4">📦</p>
                      <p className="text-white font-semibold mb-2">No listings yet</p>
                      <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>List an item to start selling</p>
                      <button onClick={() => window.location.href = '/sell'} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>List an Item</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {sellerListings.length > 0 && (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8B8B9E' }}>Active Listings</p>
                          {sellerListings.map(listing => (
                            <div key={listing.id} className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-white font-semibold mb-1">{listing.title}</h3>
                                  <p className="text-xs" style={{ color: '#8B8B9E' }}>📍 {listing.location}</p>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#00D4AA22', border: '1px solid #00D4AA', color: '#00D4AA' }}>
                                  FOR SALE
                                </span>
                              </div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Price</p>
                                  <p className="font-bold" style={{ color: '#F7931A' }}>${listing.aud_price?.toLocaleString()} AUD</p>
                                  <p className="text-xs" style={{ color: '#8B8B9E' }}>Qty: {listing.quantity || 1}</p>
                                </div>
                                <p className="text-xs" style={{ color: '#8B8B9E' }}>{new Date(listing.created_at).toLocaleDateString('en-AU')}</p>
                              </div>
                              <button
                                onClick={() => window.location.href = `/listing/${listing.id}`}
                                className="w-full py-2 rounded-lg text-sm font-semibold text-white"
                                style={{ backgroundColor: '#F7931A' }}
                              >
                                View Listing
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                      {sellerTrades.length > 0 && (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-widest mt-4" style={{ color: '#8B8B9E' }}>Trades</p>
                          {sellerTrades.map(trade => <TradeCard key={trade.id} trade={trade} isBuyer={false} />)}
                        </>
                      )}
                    </div>
                  )
                )}

                {activeTab === 'chats' && (
                  loadingChats ? (
                    <div className="text-center py-16"><p style={{ color: '#8B8B9E' }}>Loading chats...</p></div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-2xl mb-4">💬</p>
                      <p className="text-white font-semibold mb-2">No chats yet</p>
                      <p className="text-sm" style={{ color: '#8B8B9E' }}>Start a conversation from a listing page</p>
                    </div>
                  ) : (
                    <>
                      {selectedConvo ? (
                        <div>
                          <button
                            onClick={() => setSelectedConvo(null)}
                            className="text-sm mb-4"
                            style={{ color: '#8B8B9E', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            ← Back to chats
                          </button>
                          <XMTPChat
                            recipientAddress={selectedConvo.partnerAddress}
                            recipientLabel={`${selectedConvo.partnerAddress.slice(0, 6)}...${selectedConvo.partnerAddress.slice(-4)}`}
                            listingTitle={selectedConvo.listingTitle}
                            listingId={selectedConvo.listingId}
                            showDeleteButton={true}
                          />
                        </div>
                      ) : (
                        conversations.map((convo, i) => <ConvoCard key={i} convo={convo} />)
                      )}
                    </>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
