// ── BITROVE HOME PAGE (app/page.tsx) ──────────────────────────
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import XMTPBadge from '../components/XMTPBadge'
import { useXMTP } from '../contexts/XMTPContext'
import { useState, useEffect } from 'react'
import { CATEGORIES, MAIN_CATEGORIES } from '../../lib/categories'
import { supabase } from '../../lib/supabase'
import PriceWidget from '../components/PriceWidget'
import { getSuburbs, searchSuburbs, formatSuburb, haversineKm, type Suburb } from '../../lib/suburbs'

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
  // Early access guard
  useEffect(() => {
    const access = localStorage.getItem('bitrove_access')
    if (access !== 'granted') {
      window.location.replace('/')
    }
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const { loading: xmtpLoading } = useXMTP()
  const [activeTab, setActiveTab] = useState('buy')
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeSubCategory, setActiveSubCategory] = useState("")
  const [prices, setPrices] = useState<Prices>({ btc: 0, eth: 0, usdt: 0 })
  const [priceLoading, setPriceLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [btcCandles, setBtcCandles] = useState<any[]>([])
  const [ethCandles, setEthCandles] = useState<any[]>([])
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const [ethPrice, setEthPrice] = useState<number>(0)

  const fetchCandles = async () => {
    try {
      const [btcRes, ethRes] = await Promise.all([
        fetch('https://api.binance.com/api/v3/klines?symbol=BTCAUD&interval=1h&limit=168'),
        fetch('https://api.binance.com/api/v3/klines?symbol=ETHAUD&interval=1h&limit=168'),
      ])
      const [btcData, ethData] = await Promise.all([btcRes.json(), ethRes.json()])
      const parse = (data: any[]) => data.map((c: any) => ({ time: c[0], open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4]) }))
      setBtcCandles(parse(btcData))
      setEthCandles(parse(ethData))
    } catch (e) {}
  }

  useEffect(() => {
    fetchCandles()
    const interval = setInterval(fetchCandles, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  const [suburbs, setSuburbs] = useState<Suburb[]>([])
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<Suburb[]>([])
  const [selectedSuburb, setSelectedSuburb] = useState<Suburb | null>(null)
  const [radiusKm, setRadiusKm] = useState<number>(50)

  useEffect(() => { getSuburbs().then(setSuburbs) }, [])

  const handleLocationInput = (val: string) => {
    setLocationQuery(val)
    setSelectedSuburb(null)
    setLocationSuggestions(searchSuburbs(suburbs, val))
  }

  const selectLocationSuburb = (s: Suburb) => {
    setLocationQuery(formatSuburb(s))
    setSelectedSuburb(s)
    setLocationSuggestions([])
  }

  const clearLocation = () => {
    setLocationQuery('')
    setSelectedSuburb(null)
    setLocationSuggestions([])
  }

  const filteredByLocation = (items: any[]) => {
    if (!selectedSuburb) return items
    return items.filter(item => {
      if (!item.lat || !item.lng) return true
      const dist = haversineKm(selectedSuburb.lat, selectedSuburb.lng, Number(item.lat), Number(item.lng))
      return dist <= radiusKm
    })
  }

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
        setBtcPrice(data.btc || 0)
        setEthPrice(data.eth || 0)
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
      if (activeCategory !== "All") query = query.eq("category", activeCategory)
      if (activeSubCategory) query = query.eq("subcategory", activeSubCategory)
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`)
      const { data } = await query
      if (data) setListings(data)
      setListingsLoading(false)
    }
    fetchListings()
  }, [activeCategory, activeSubCategory, searchQuery])

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
        <div className="flex items-center gap-3">
          <XMTPBadge />
          <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          <button
            className="md:hidden px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', color: '#F7931A' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {xmtpLoading && (
        <div className="px-6 py-2 text-center text-xs" style={{ backgroundColor: '#13131A', borderBottom: '1px solid #2A2A3A', color: '#F7931A' }}>
          🔒 Setting up encrypted chat — please sign the MetaMask request (free, one-time only)
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-4 border-b flex flex-col gap-2" style={{ borderColor: '#2A2A3A', backgroundColor: '#0A0A0F' }}>
          <button onClick={() => { setActiveTab('buy'); setMobileMenuOpen(false) }} className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left" style={{ backgroundColor: activeTab === 'buy' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'buy' ? '#fff' : '#8B8B9E' }}>🛒 Buy</button>
          <button onClick={() => { setActiveTab('sell'); setMobileMenuOpen(false) }} className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left" style={{ backgroundColor: activeTab === 'sell' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'sell' ? '#fff' : '#8B8B9E' }}>📦 Sell</button>
          <button onClick={() => { setActiveTab('trades'); setMobileMenuOpen(false) }} className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left" style={{ backgroundColor: activeTab === 'trades' ? '#F7931A' : '#13131A', border: '1px solid #2A2A3A', color: activeTab === 'trades' ? '#fff' : '#8B8B9E' }}>My Trades</button>
        </div>
      )}

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
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="flex-1 px-4 py-3 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
          />
          <button onClick={() => setSearchQuery(searchQuery.trim())} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Search</button>
        </div>

        {/* Location Filter */}
        <div className="max-w-2xl mx-auto mt-3 flex gap-2 flex-wrap">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="📍 Filter by suburb..."
              value={locationQuery}
              onChange={e => handleLocationInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-white outline-none text-sm"
              style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}
              autoComplete="off"
            />
            {selectedSuburb && (
              <button onClick={clearLocation} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8B8B9E', cursor: 'pointer', fontSize: 16 }}>✕</button>
            )}
            {locationSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#13131A', border: '1px solid #2A2A3A', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
                {locationSuggestions.map((s, i) => (
                  <div key={i} onClick={() => selectLocationSuburb(s)} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem', color: '#fff', borderBottom: '1px solid #1A1A2A' }} onMouseEnter={e => (e.currentTarget.style.background = '#1A1A2A')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {formatSuburb(s)}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedSuburb && (
            <select value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))} className="px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
              <option value={10}>Within 10km</option>
              <option value={25}>Within 25km</option>
              <option value={50}>Within 50km</option>
              <option value={100}>Within 100km</option>
              <option value={250}>Within 250km</option>
            </select>
          )}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: '#8B8B9E' }}>Browse Categories</p>

          <style>{`
            .cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
            @media (max-width: 768px) { .cat-grid { grid-template-columns: repeat(4, 1fr); } }
            @media (max-width: 480px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
            .cat-card {
              background: #13131A; border: 1px solid #2A2A3A; border-radius: 16px;
              padding: 16px 8px 12px; display: flex; flex-direction: column;
              align-items: center; gap: 8px; cursor: pointer; position: relative; overflow: hidden;
              transition: border-color 0.2s, transform 0.2s, background 0.2s;
            }
            .cat-card:hover { border-color: #F7931A; transform: translateY(-2px); background: #1A1A24; }
            .cat-card.cat-active { border-color: #F7931A; background: rgba(247,147,26,0.08); }
            .cat-glow {
              position: absolute; inset: 0;
              background: radial-gradient(ellipse at 50% 0%, rgba(247,147,26,0.15) 0%, transparent 70%);
              opacity: 0; transition: opacity 0.3s; pointer-events: none;
            }
            .cat-card.cat-active .cat-glow { opacity: 1; }
            .cat-icon { font-size: 26px; line-height: 1; transition: transform 0.3s; }
            .cat-card:hover .cat-icon { transform: scale(1.18) rotate(-4deg); }
            .cat-card.cat-active .cat-icon { transform: scale(1.12); }
            .cat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.02em; color: #8B8B9E; text-align: center; line-height: 1.2; transition: color 0.2s; }
            .cat-card:hover .cat-label, .cat-card.cat-active .cat-label { color: #F7931A; }
            .sub-pill {
              background: #0A0A0F; border: 1px solid #2A2A3A; border-radius: 20px;
              padding: 5px 14px; font-size: 11px; color: #8B8B9E; cursor: pointer;
              transition: all 0.15s; white-space: nowrap;
            }
            .sub-pill:hover { border-color: #00D4AA; color: #00D4AA; }
            .sub-pill.sub-active { border-color: #00D4AA; color: #00D4AA; background: rgba(0,212,170,0.08); }
          `}</style>

          {(() => {
            const categoryIcons: Record<string, string> = {
              'All': '🔥',
              'Electronics': '💻',
              'Vehicles': '🚗',
              'Boats & Marine': '⛵',
              'Fashion': '👗',
              'Home & Garden': '🏡',
              'Sports & Outdoors': '🏄',
              'Gaming': '🎮',
              'Music': '🎸',
              'Collectibles': '🏆',
              'Tools & Equipment': '🔧',
              'Other': '📦',
            }
            const allCats = ['All', ...MAIN_CATEGORIES]
            return (
              <>
                <div className="cat-grid mb-4">
                  {allCats.map(cat => (
                    <div
                      key={cat}
                      className={`cat-card ${activeCategory === cat ? 'cat-active' : ''}`}
                      onClick={() => { setActiveCategory(cat); setActiveSubCategory('') }}
                    >
                      <div className="cat-glow" />
                      <span className="cat-icon">{categoryIcons[cat] || '📦'}</span>
                      <span className="cat-label">{cat}</span>
                    </div>
                  ))}
                </div>
                {activeCategory !== 'All' && CATEGORIES[activeCategory] && (
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className={`sub-pill ${activeSubCategory === '' ? 'sub-active' : ''}`}
                      onClick={() => setActiveSubCategory('')}
                    >All</div>
                    {CATEGORIES[activeCategory].map((sub: string) => (
                      <div
                        key={sub}
                        className={`sub-pill ${activeSubCategory === sub ? 'sub-active' : ''}`}
                        onClick={() => setActiveSubCategory(sub)}
                      >{sub}</div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* ── Live Price Bar ── */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-4 py-3 rounded-lg flex-wrap" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: '#F7931A' }}>₿</span>
            <span className="text-white font-mono text-sm">BTC</span>
            <span className="font-bold" style={{ color: '#F7931A' }}>{priceLoading ? 'Loading...' : `$${(prices.btc || 0).toLocaleString()} AUD`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#8B8B9E' }}>Ξ</span>
            <span className="text-white font-mono text-sm">ETH</span>
            <span className="font-bold" style={{ color: '#8B8B9E' }}>{priceLoading ? 'Loading...' : `$${(prices.eth || 0).toLocaleString()} AUD`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#00D4AA' }}>◈</span>
            <span className="text-white font-mono text-sm">USDT</span>
            <span className="font-bold" style={{ color: '#00D4AA' }}>{priceLoading ? 'Loading...' : `$${(prices.usdt || 1.58).toFixed(2)} AUD`}</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredByLocation(listings).map((item) => {
                  const config = tokenConfig[item.token as keyof typeof tokenConfig]
                  const cryptoPrice = getPrice(item.aud_price, item.token)
                  return (
                    <div key={item.id} onClick={() => window.location.href = `/listing/${item.id}`} className="rounded-xl overflow-hidden cursor-pointer transition-all" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#F7931A')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A3A')}>
                      <div style={{ backgroundColor: '#1A1A2A', aspectRatio: '1/1', overflow: 'hidden' }}>
                        {item.photos && item.photos.length > 0 ? (
                          <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span style={{ fontSize: 48 }}>📦</span></div>
                        )}
                      </div>
                      <div className="p-2">
                        {item.is_featured && <div className="mb-1"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F7931A22', border: '1px solid #F7931A', color: '#F7931A' }}>⭐ Featured</span></div>}
                        <h3 className="text-white text-xs font-medium mb-1 truncate">{item.title}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0A0A0F', border: `1px solid ${config.color}`, color: config.color }}>Settles {item.token}</span>
                          <span className="text-xs" style={{ color: '#00D4AA' }}>✓ Escrow</span>
                        </div>
                        <p className="font-bold text-base" style={{ color: config.color }}>{config.symbol} {cryptoPrice}</p>
                        <p className="text-xs" style={{ color: '#8B8B9E' }}>≈ ${item.aud_price.toLocaleString()} AUD</p>
                        {item.listed_token_price && (
                          <div className="mt-1" onClick={e => e.stopPropagation()}>
                            <PriceWidget
                              token={item.token}
                              listedTokenPrice={item.listed_token_price}
                              currentPrice={item.token === 'BTC' ? btcPrice : item.token === 'ETH' ? ethPrice : 1}
                              candles={item.token === 'BTC' ? btcCandles : item.token === 'ETH' ? ethCandles : []}
                              compact={true}
                            />
                          </div>
                        )}
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
            <p className="mb-8" style={{ color: '#8B8B9E' }}>Connect your wallet to view your active trades and history.</p>
            <button onClick={() => window.location.href = '/trades'} className="px-8 py-4 rounded-lg font-semibold text-white text-lg" style={{ backgroundColor: '#F7931A' }}>View My Trades</button>
          </div>
        </div>
      )}

    </main>
  )
}