// ── BITROVE HOME PAGE (app/page.tsx) ──────────────────────────
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Prices {
  btc: number
  eth: number
  usdt: number
}

const tokenConfig = {
  BTC: { symbol: '₿', color: '#F7931A', decimals: 6 },
  ETH: { symbol: 'Ξ', color: '#8B8B9E', decimals: 4 },
  USDT: { symbol: '◈', color: '#00D4AA', decimals: 2 },
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('buy')
  const [activeCategory, setActiveCategory] = useState('All')
  const [prices, setPrices] = useState<Prices>({ btc: 0, eth: 0, usdt: 0 })
  const [priceLoading, setPriceLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)

  // ── Price feed ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices')
        const data = await res.json()
        setPrices({
          btc: data.btc || 0,
          eth: data.eth || 0,
          usdt: data.usdt || 1.58,
        })
        setPriceLoading(false)
      } catch (e) {
        console.error('Price fetch failed:', e)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Listings fetch ──────────────────────────────────────────────
  useEffect(() => {
    const fetchListings = async () => {
      setListingsLoading(true)
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      if (activeCategory !== 'All') query = query.eq('category', activeCategory)
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`)
      const { data } = await query
      if (data) setListings(data)
      setListingsLoading(false)
    }
    fetchListings()
  }, [activeCategory, searchQuery])

  // ── Price helper ────────────────────────────────────────────────
  const getPrice = (audPrice: number, token: string) => {
    const priceMap: Record<string, number> = { BTC: prices.btc, ETH: prices.eth, USDT: prices.usdt }
    const decimals: Record<string, number> = { BTC: 6, ETH: 4, USDT: 2 }
    const p = priceMap[token]
    return p ? (audPrice / p).toFixed(decimals[token]) : '...'
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</span>
          <div className="hidden md:flex gap-2">
            <button onClick={() => setActiveTab('buy')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: activeTab === 'buy' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'buy' ? '#fff' : '#8B8B9E' }}>🛒 Buy</button>
            <button onClick={() => setActiveTab('sell')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: activeTab === 'sell' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'sell' ? '#fff' : '#8B8B9E' }}>📦 Sell</button>
            <button onClick={() => setActiveTab('trades')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: activeTab === 'trades' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'trades' ? '#fff' : '#8B8B9E' }}>My Trades</button>
          </div>
        </div>
        <ConnectButton />
      </nav>

      {/* ── Hero Search ── */}
      <div className="text-center py-16 px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Buy. Sell. Get paid in crypto.</h1>
        <p className="text-lg mb-8" style={{ color: '#00D4AA' }}>The marketplace that rewards you for watching the market.</p>
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Search for anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
          />
          <button className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Search</button>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white font-semibold mb-4">Browse Categories</h2>
          <div className="flex gap-3 flex-wrap">
            {['All', 'Electronics', 'Vehicles', 'Fashion', 'Home', 'Sports', 'Collectibles', 'Other'].map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className="px-4 py-2 rounded-full text-sm font-medium transition-all" style={{ backgroundColor: activeCategory === cat ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeCategory === cat ? '#fff' : '#8B8B9E' }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Price Bar ── */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-4 py-3 rounded-lg flex-wrap" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: '#F7931A' }}>₿</span>
            <span className="text-white font-mono text-sm">BTC</span>
            <span className="font-bold" style={{ color: '#F7931A' }}>
              {priceLoading ? 'Loading...' : `$${(prices.btc || 0).toLocaleString()} AUD`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#8B8B9E' }}>Ξ</span>
            <span className="text-white font-mono text-sm">ETH</span>
            <span className="font-bold" style={{ color: '#8B8B9E' }}>
              {priceLoading ? 'Loading...' : `$${(prices.eth || 0).toLocaleString()} AUD`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#00D4AA' }}>◈</span>
            <span className="text-white font-mono text-sm">USDT</span>
            <span className="font-bold" style={{ color: '#00D4AA' }}>
              {priceLoading ? 'Loading...' : `$${(prices.usdt || 1.58).toFixed(2)} AUD`}
            </span>
          </div>
          <span className="text-xs ml-auto" style={{ color: '#8B8B9E' }}>Live prices — updates every 30s</span>
        </div>
      </div>

      {/* ── Buy Tab ── */}
      {activeTab === 'buy' && (
        <div className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-white font-semibold mb-6">
              {activeCategory === 'All' ? 'Recent Listings' : activeCategory}
              {listings.length > 0 && <span className="text-sm font-normal ml-2" style={{ color: '#8B8B9E' }}>({listings.length} items)</span>}
            </h2>
            {listingsLoading ? (
              <div className="text-center py-16"><p style={{ color: '#8B8B9E' }}>Loading listings...</p></div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl mb-4">📦</p>
                <p className="text-white font-semibold mb-2">No listings yet</p>
                <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Be the first to sell something on Bitrove</p>
                <button onClick={() => window.location.href = '/sell'} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>List an Item</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((item) => {
                  const config = tokenConfig[item.token as keyof typeof tokenConfig]
                  const cryptoPrice = getPrice(item.aud_price, item.token)
                  return (
                    <div key={item.id} onClick={() => window.location.href = `/listing/${item.id}`} className="rounded-xl overflow-hidden cursor-pointer transition-all" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#F7931A')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A3A')}>
                      <div className="h-48 overflow-hidden" style={{ backgroundColor: '#1A1A2A' }}>
                        {item.photos && item.photos.length > 0 ? (
                          <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span style={{ fontSize: 48 }}>📦</span></div>
                        )}
                      </div>
                      <div className="p-4">
                        {item.is_featured && <div className="mb-2"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7931A22', border: '1px solid #F7931A', color: '#F7931A' }}>⭐ Featured</span></div>}
                        <h3 className="text-white font-medium mb-1">{item.title}</h3>
                        <p className="text-xs mb-3" style={{ color: '#8B8B9E' }}>{item.location}</p>
                        <div className="mb-3"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#0A0A0F', border: `1px solid ${config.color}`, color: config.color }}>Settles in {item.token}</span></div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs" style={{ color: '#8B8B9E' }}>Price</p>
                            <p className="font-bold text-lg" style={{ color: config.color }}>{config.symbol} {cryptoPrice}</p>
                            <p className="text-xs" style={{ color: '#8B8B9E' }}>≈ ${item.aud_price.toLocaleString()} AUD</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); window.location.href = `/listing/${item.id}` }} className="px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Buy Now</button>
                        </div>
                        <div className="mt-3"><span className="text-xs" style={{ color: '#00D4AA' }}>✓ Escrow Protected</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sell Tab ── */}
      {activeTab === 'sell' && (
        <div className="px-6 pb-16">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold text-white mb-4">List an Item for Sale</h2>
            <p className="mb-8" style={{ color: '#8B8B9E' }}>Connect your wallet to start selling. Your wallet is your account — no registration needed.</p>
            <button onClick={() => window.location.href = '/sell'} className="px-8 py-4 rounded-lg font-semibold text-white text-lg" style={{ backgroundColor: '#F7931A' }}>List an Item</button>
          </div>
        </div>
      )}

      {/* ── My Trades Tab ── */}
      {activeTab === 'trades' && (
        <div className="px-6 pb-16">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold text-white mb-4">My Trades</h2>
            <p className="mb-8" style={{ color: '#8B8B9E' }}>View your active purchases and sales.</p>
            <button
              onClick={() => window.location.href = '/trades'}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg"
              style={{ backgroundColor: '#F7931A' }}
            >
              View My Trades
            </button>
          </div>
        </div>
      )}

    </main>
  )
}