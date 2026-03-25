// ── BITROVE MY TRADES PAGE (app/trades/page.tsx) ───────────────
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '../../lib/supabase'

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
  const { address, isConnected } = useAccount()
  const [buyerTrades, setBuyerTrades] = useState<any[]>([])
  const [sellerTrades, setSellerTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying')
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
      if (buying) setBuyerTrades(buying)
      if (selling) setSellerTrades(selling)
      setLoading(false)
    }
    fetchTrades()
  }, [address])

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

  if (!mounted) return null

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
        </div>
        <ConnectButton />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">My Trades</h1>

        {!isConnected ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <p className="text-white font-semibold mb-4">Connect your wallet to view your trades</p>
            <ConnectButton />
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
                📦 Selling ({sellerTrades.length})
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16"><p style={{ color: '#8B8B9E' }}>Loading trades...</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeTab === 'buying' && (
                  buyerTrades.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-2xl mb-4">🛒</p>
                      <p className="text-white font-semibold mb-2">No purchases yet</p>
                      <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Browse the marketplace and make your first purchase</p>
                      <button onClick={() => window.location.href = '/'} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Browse Listings</button>
                    </div>
                  ) : buyerTrades.map(trade => <TradeCard key={trade.id} trade={trade} isBuyer={true} />)
                )}
                {activeTab === 'selling' && (
                  sellerTrades.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-2xl mb-4">📦</p>
                      <p className="text-white font-semibold mb-2">No sales yet</p>
                      <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>List an item to start selling</p>
                      <button onClick={() => window.location.href = '/sell'} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>List an Item</button>
                    </div>
                  ) : sellerTrades.map(trade => <TradeCard key={trade.id} trade={trade} isBuyer={false} />)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
