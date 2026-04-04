// ── BITROVE LISTING DETAIL PAGE (app/listing/[id]/page.tsx) ───
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { parseUnits, keccak256, encodePacked } from 'viem'
import { supabase } from '../../../lib/supabase'
import PriceWidget from '../../components/PriceWidget'
import { CONTRACT_ADDRESS, CONTRACT_ABI, ERC20_ABI, TOKENS } from '../../../lib/contract'
import { encryptAddress } from '../../../lib/encryption'
import XMTPChat from '../../components/XMTPChat'

interface Prices {
  btc: number
  eth: number
  usdt: number
}

const tokenConfig = {
  BTC:  { symbol: '₿', color: '#F7931A', decimals: 8,  contractToken: 'WBTC' },
  ETH:  { symbol: 'Ξ', color: '#8B8B9E', decimals: 18, contractToken: 'WETH' },
  USDT: { symbol: '◈', color: '#00D4AA', decimals: 6,  contractToken: 'USDT' },
}

const conditionColor: Record<string, string> = {
  'New':      '#00D4AA',
  'Like New': '#00D4AA',
  'Good':     '#F7931A',
  'Fair':     '#8B8B9E',
}

export default function ListingPage() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const [prices, setPrices] = useState<Prices>({ btc: 0, eth: 0, usdt: 0 })
  // Early access guard
  useEffect(() => {
    const access = localStorage.getItem('bitrove_access')
    if (access !== 'granted') {
      window.location.href = '/'
    }
  }, [])

  const [listing, setListing] = useState<any>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const [candles, setCandles] = useState<any[]>([])
  const [currentTokenPrice, setCurrentTokenPrice] = useState<number>(0)

  useEffect(() => {
    if (!listing) return
    if (listing.token === 'USDT') return
    const symbol = listing.token === 'BTC' ? 'BTCAUD' : 'ETHAUD'
    const fetchCandles = async () => {
      try {
        const [candleRes, priceRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=168`),
          fetch('/api/prices'),
        ])
        const candleData = await candleRes.json()
        const priceData = await priceRes.json()
        setCandles(candleData.map((c: any) => ({ time: c[0], open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4]) })))
        setCurrentTokenPrice(listing.token === 'BTC' ? priceData.btc : priceData.eth)
      } catch (e) {}
    }
    fetchCandles()
    const interval = setInterval(fetchCandles, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [listing])
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidExpiry, setBidExpiry] = useState('48')
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidSuccess, setBidSuccess] = useState(false)
  const [bids, setBids] = useState<any[]>([])
  const [userBid, setUserBid] = useState<any>(null)

  useEffect(() => {
    if (!listing) return
    const fetchBids = async () => {
      const { data } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', listing.id)
        .eq('status', 'pending')
        .order('aud_amount', { ascending: false })
      if (data) {
        setBids(data)
        if (address) setUserBid(data.find((b: any) => b.buyer_address.toLowerCase() === address.toLowerCase()) || null)
      }
    }
    fetchBids()
    const interval = setInterval(fetchBids, 10000)
    return () => clearInterval(interval)
  }, [listing, address])

  const handlePlaceBid = async () => {
    if (!address || !bidAmount || !listing) return
    setBidSubmitting(true)
    const aud = parseFloat(bidAmount)
    const priceMap: Record<string, number> = { BTC: prices.btc, ETH: prices.eth, USDT: prices.usdt }
    const crypto = priceMap[listing.token] ? aud / priceMap[listing.token] : 0
    const expiresAt = new Date(Date.now() + parseInt(bidExpiry) * 60 * 60 * 1000).toISOString()
    await supabase.from('bids').insert([{
      listing_id: listing.id,
      buyer_address: address,
      aud_amount: aud,
      crypto_amount: crypto,
      token: listing.token,
      status: 'pending',
      expires_at: expiresAt,
    }])
    setBidSubmitting(false)
    setBidSuccess(true)
    setTimeout(() => { setShowBidModal(false); setBidSuccess(false); setBidAmount('') }, 2000)
  }
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [buyStep, setBuyStep] = useState<'details' | 'approving' | 'funding' | 'complete'>('details')
  const [error, setError] = useState('')

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [params.id])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices')
        const data = await res.json()
        setPrices({ btc: data.btc, eth: data.eth, usdt: data.usdt })
      } catch (e) {
        console.error('Price fetch failed:', e)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)

  return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
        <p style={{ color: '#8B8B9E' }}>Loading listing...</p>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
        <p className="text-white">Listing not found.</p>
      </main>
    )
  }

  const config = tokenConfig[listing.token as keyof typeof tokenConfig]
  const priceMap: Record<string, number> = { BTC: prices.btc, ETH: prices.eth, USDT: prices.usdt }
  const audPrice = listing.aud_price
  const tokenPrice = priceMap[listing.token]
  const cryptoAmount = tokenPrice ? (audPrice / tokenPrice) : 0
  const cryptoPrice = cryptoAmount ? cryptoAmount.toFixed(6) : '...'

  const generateTradeId = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString()
    return keccak256(encodePacked(['string', 'string'], [timestamp, random]))
  }

  const handleBuy = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }
    if (!deliveryAddress.trim() && listing.delivery_type !== 'collection') {
      setError('Please enter your delivery address')
      return
    }
    if (!tokenPrice) {
      setError('Price not loaded yet — please wait')
      return
    }

    setError('')
    const contractToken = TOKENS[config.contractToken as keyof typeof TOKENS]
    const tokenDecimals = contractToken.decimals
    const rawAmount = parseUnits(cryptoAmount.toFixed(tokenDecimals > 8 ? 8 : tokenDecimals), tokenDecimals)
    const tradeId = generateTradeId()

    try {
      setBuyStep('approving')
      const approveHash = await writeContractAsync({
        address: contractToken.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, rawAmount],
      })


      setBuyStep('funding')
      const fundHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'fundTrade',
        args: [tradeId, listing.seller_address as `0x${string}`, contractToken.address, rawAmount],
      })
      await publicClient!.waitForTransactionReceipt({ hash: fundHash })

      await supabase.from('trades').insert([{
        listing_id: listing.id,
        buyer_address: address,
        seller_address: listing.seller_address,
        aud_price: audPrice,
        token: listing.token,
        crypto_amount: cryptoAmount,
        encrypted_address: encryptAddress(deliveryAddress, tradeId, address!, listing.seller_address),
        trade_id_onchain: tradeId,
        status: 'funded',
      }])

      const newQuantity = (listing.quantity || 1) - 1
      await supabase
        .from('listings')
        .update(newQuantity <= 0 ? { status: 'sold', quantity: 0 } : { quantity: newQuantity })
        .eq('id', listing.id)

      setBuyStep('complete')

    } catch (e: any) {
      console.error('Buy failed:', e)
      setError(e.message || 'Transaction failed — please try again')
      setBuyStep('details')
    }
  }

  const handleReport = async () => {
    if (!reportReason) return
    setReportSubmitting(true)
    try {
      await supabase.from('reports').insert([{
        listing_id: listing.id,
        reason: reportReason,
        reporter_address: address || 'anonymous',
        status: 'pending'
      }])
    } catch (e) {}
    setReportSubmitted(true)
    setReportSubmitting(false)
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>

      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
        </div>
        <ConnectButton />
      </nav>

      <div className="px-6 py-4 max-w-6xl mx-auto">
        <a href="/browse" className="text-sm" style={{ color: '#8B8B9E' }}>← Back to listings</a>
      </div>

      <div className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>
            <div className="w-full rounded-xl overflow-hidden flex items-center justify-center mb-4" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', aspectRatio: '1/1' }}>
              {listing.photos && listing.photos.length > 0 ? (
                <img src={listing.photos[selectedPhoto]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontSize: 96 }}>📦</span>
              )}
            </div>
            {listing.photos && listing.photos.length > 1 && (
              <div className="flex gap-3">
                {listing.photos.map((photo: string, i: number) => (
                  <button key={i} onClick={() => setSelectedPhoto(i)} className="w-20 h-20 rounded-lg overflow-hidden" style={{ border: `2px solid ${selectedPhoto === i ? '#F7931A' : '#2A2A3A'}` }}>
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex gap-2 mb-4">
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A', color: '#8B8B9E' }}>{listing.category}</span>
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#13131A', border: `1px solid ${conditionColor[listing.condition] || '#8B8B9E'}`, color: conditionColor[listing.condition] || '#8B8B9E' }}>{listing.condition}</span>
              {listing.is_featured && <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#F7931A22', border: '1px solid #F7931A', color: '#F7931A' }}>⭐ Featured</span>}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{listing.title}</h1>
            <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>📍 {listing.location}</p>

            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
              <p className="text-sm mb-1" style={{ color: '#8B8B9E' }}>Settlement token</p>
              <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ backgroundColor: '#0A0A0F', border: `1px solid ${config.color}`, color: config.color }}>{listing.token}</span>
              <p className="text-3xl font-bold mt-3" style={{ color: config.color }}>{config.symbol} {cryptoPrice}</p>
              <p className="text-sm mt-1" style={{ color: '#8B8B9E' }}>≈ ${audPrice.toLocaleString()} AUD</p>
              <p className="text-xs mt-1" style={{ color: '#8B8B9E' }}>Price updates every 30 seconds</p>
            </div>
            {listing.listed_token_price && (
              <div className="mb-6">
                <PriceWidget
                  token={listing.token}
                  listedTokenPrice={listing.listed_token_price}
                  currentPrice={currentTokenPrice}
                  candles={candles}
                  compact={false}
                />
              </div>
            )}

            <XMTPChat
              recipientAddress={listing.seller_address}
              recipientLabel={`Seller ${listing.seller_address.slice(0, 6)}...${listing.seller_address.slice(-4)}`}
              listingTitle={listing.title}
              listingId={listing.id}
            />

            {/* Order Book */}
            {bids.length > 0 && (
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>📊 Order Book</span>
                  <span style={{ fontSize: '0.72rem', color: '#8B8B9E' }}>{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ borderBottom: '1px solid #2A2A3A', paddingBottom: 8, marginBottom: 8 }}>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '0.72rem', color: '#8B8B9E' }}>ASK</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F7931A' }}>${audPrice.toLocaleString()} AUD</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8B8B9E', marginBottom: 6 }}>BIDS</div>
                {bids.slice(0, 5).map((bid, i) => {
                  const hoursLeft = Math.max(0, Math.round((new Date(bid.expires_at).getTime() - Date.now()) / 3600000))
                  const isMyBid = address && bid.buyer_address.toLowerCase() === address.toLowerCase()
                  return (
                    <div key={bid.id} className="flex justify-between items-center mb-1">
                      <span style={{ fontSize: '0.8rem', color: isMyBid ? '#00D4AA' : '#fff', fontWeight: isMyBid ? 700 : 400 }}>
                        ${bid.aud_amount.toLocaleString()} AUD {isMyBid && '(yours)'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#8B8B9E' }}>⏱ {hoursLeft}hrs</span>
                    </div>
                  )
                })}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #2A2A3A', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', color: '#8B8B9E' }}>Spread</span>
                  <span style={{ fontSize: '0.72rem', color: bids[0]?.aud_amount >= audPrice ? '#00D4AA' : '#F7931A' }}>
                    ${(audPrice - bids[0]?.aud_amount).toLocaleString()} AUD ({(((audPrice - bids[0]?.aud_amount) / audPrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Buy Now + Place Bid buttons */}
            {address?.toLowerCase() !== listing.seller_address.toLowerCase() && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="flex-1 py-4 rounded-xl font-bold text-white text-base"
                  style={{ backgroundColor: '#F7931A' }}
                >
                  Buy Now
                </button>
                <button
                  onClick={() => setShowBidModal(true)}
                  className="flex-1 py-4 rounded-xl font-bold text-base"
                  style={{ backgroundColor: 'transparent', border: '2px solid #F7931A', color: '#F7931A' }}
                >
                  Place Bid
                </button>
              </div>
            )}

            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#00D4AA' }}>✓ How escrow works</p>
              <p className="text-xs" style={{ color: '#8B8B9E' }}>Your funds are locked in a smart contract until you confirm receipt. If something goes wrong, raise a dispute and we will resolve it.</p>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
              <p className="text-xs mb-2" style={{ color: '#8B8B9E' }}>Seller</p>
              <p className="font-mono text-sm text-white">{listing.seller_address.slice(0, 6)}...{listing.seller_address.slice(-4)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
          <h2 className="text-white font-semibold mb-4">Description</h2>
          <p style={{ color: '#8B8B9E' }}>{listing.description}</p>
        </div>
      </div>

      {/* ── Bid Modal ── */}
      {showBidModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 max-w-md w-full mx-4" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <button onClick={() => { setShowBidModal(false); setBidAmount(''); setBidSuccess(false) }} style={{ float: 'right', background: 'none', border: 'none', color: '#8B8B9E', fontSize: 20, cursor: 'pointer' }}>✕</button>
            {bidSuccess ? (
              <div className="text-center py-8">
                <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
                <h2 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Bid Placed!</h2>
                <p style={{ color: '#8B8B9E', fontSize: '0.88rem' }}>The seller has been notified. You will be alerted if they accept, reject, or counter your offer.</p>
              </div>
            ) : (
              <>
                <h2 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>Place a Bid</h2>
                <p style={{ color: '#8B8B9E', fontSize: '0.82rem', marginBottom: 20 }}>Ask price: ${audPrice.toLocaleString()} AUD — offer below ask and the seller can accept, counter, or reject.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Your Offer (AUD)</label>
                  <input
                    type="number"
                    placeholder={`e.g. ${Math.round(audPrice * 0.9).toLocaleString()}`}
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                  {bidAmount && parseFloat(bidAmount) > 0 && (
                    <p style={{ color: '#00D4AA', fontSize: '0.78rem', marginTop: 6 }}>
                      ≈ {listing.token === 'USDT' ? '' : config.symbol} {(parseFloat(bidAmount) / (listing.token === 'BTC' ? prices.btc : listing.token === 'ETH' ? prices.eth : prices.usdt)).toFixed(6)} {listing.token}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Bid Expires In</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ label: '24hrs', val: '24' }, { label: '48hrs', val: '48' }, { label: '7 days', val: '168' }].map(({ label, val }) => (
                      <button key={val} onClick={() => setBidExpiry(val)} style={{ flex: 1, padding: '8px', borderRadius: 8, backgroundColor: bidExpiry === val ? '#F7931A' : '#0A0A0F', border: `1px solid ${bidExpiry === val ? '#F7931A' : '#2A2A3A'}`, color: bidExpiry === val ? '#0A0A0F' : '#8B8B9E', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || parseFloat(bidAmount) <= 0 || bidSubmitting || !isConnected}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: bidAmount && parseFloat(bidAmount) > 0 ? '#F7931A' : '#2A2A3A', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}
                >
                  {bidSubmitting ? 'Placing Bid...' : !isConnected ? 'Connect Wallet to Bid' : `Bid $${bidAmount ? parseFloat(bidAmount).toLocaleString() : '0'} AUD`}
                </button>
                <p style={{ color: '#8B8B9E', fontSize: '0.72rem', marginTop: 12, textAlign: 'center' }}>No funds leave your wallet until the seller accepts and you confirm.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Report Button ── */}
      <div className="text-center mt-2 mb-4">
        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs"
          style={{ color: '#8B8B9E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          🚩 Report this listing
        </button>
      </div>

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-8 max-w-md w-full mx-4" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <button onClick={() => { setShowReportModal(false); setReportReason(''); setReportSubmitted(false) }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#8B8B9E', fontSize: 20, cursor: 'pointer' }}>✕</button>
            {reportSubmitted ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-4">✅</p>
                <h2 className="text-white font-bold mb-2">Report Received</h2>
                <p className="text-sm" style={{ color: '#8B8B9E' }}>Thank you for helping keep Bitrove safe. We will review this listing shortly.</p>
                <button onClick={() => { setShowReportModal(false); setReportSubmitted(false) }} className="mt-6 w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>Close</button>
              </div>
            ) : (
              <>
                <h2 className="text-white font-bold mb-2">Report Listing</h2>
                <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Select a reason for reporting this listing. All reports are reviewed manually.</p>
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    'Offensive or inappropriate content',
                    'Scam or fraudulent listing',
                    'Prohibited or illegal item',
                    'Counterfeit or fake goods',
                    'Misleading photos or description',
                    'Spam or duplicate listing',
                    'Other',
                  ].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className="text-left px-4 py-3 rounded-lg text-sm"
                      style={{ backgroundColor: reportReason === reason ? '#F7931A22' : '#0A0A0F', border: `1px solid ${reportReason === reason ? '#F7931A' : '#2A2A3A'}`, color: reportReason === reason ? '#F7931A' : '#8B8B9E' }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#8B8B9E' }}>Cancel</button>
                  <button onClick={handleReport} disabled={!reportReason || reportSubmitting} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: reportReason ? '#ff4444' : '#2A2A3A' }}>
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-8 max-w-md w-full mx-4" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>

            {buyStep === 'complete' ? (
              <div className="text-center">
                <p className="text-4xl mb-4">🎉</p>
                <h2 className="text-white text-xl font-bold mb-2">Purchase Complete!</h2>
                <p className="text-sm mb-4" style={{ color: '#8B8B9E' }}>Your funds are locked in escrow. The seller has been notified and will ship your item.</p>
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
                  <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Amount in escrow</p>
                  <p className="font-bold" style={{ color: config.color }}>{config.symbol} {cryptoPrice}</p>
                </div>
                <p className="text-xs mb-6" style={{ color: '#8B8B9E' }}>Once you receive your item, go to My Trades and confirm receipt to release payment to the seller.</p>
                <button onClick={() => window.location.href = '/trades'} className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#F7931A' }}>View My Trades</button>
              </div>
            ) : (
              <>
                <h2 className="text-white text-xl font-bold mb-2">Complete Purchase</h2>
                <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Your delivery address will be encrypted and only visible to the seller.</p>

                <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
                  <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>You are paying</p>
                  <p className="text-2xl font-bold" style={{ color: config.color }}>{config.symbol} {cryptoPrice}</p>
                  <p className="text-xs" style={{ color: '#8B8B9E' }}>≈ ${audPrice.toLocaleString()} AUD</p>
                </div>

                <textarea
                  placeholder="Enter your delivery address..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white outline-none mb-4 resize-none"
                  style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}
                  rows={3}
                  disabled={buyStep !== 'details'}
                />

                {buyStep !== 'details' && (
                  <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
                    <p className="text-xs mb-2" style={{ color: buyStep === 'approving' ? '#F7931A' : '#00D4AA' }}>
                      {buyStep === 'approving' ? '⏳ Step 1/2 — Approving token spend in MetaMask...' : '✅ Step 1/2 — Token approved'}
                    </p>
                    <p className="text-xs" style={{ color: buyStep === 'funding' ? '#F7931A' : '#8B8B9E' }}>
                      {buyStep === 'funding' ? '⏳ Step 2/2 — Funding escrow in MetaMask...' : 'Step 2/2 — Fund escrow'}
                    </p>
                  </div>
                )}

                {error && <p className="text-xs mb-4" style={{ color: '#ff4444' }}>{error}</p>}

                <p className="text-xs mb-6" style={{ color: '#8B8B9E' }}>🔒 2% Bitrove fee applies. Funds held in escrow until you confirm receipt.</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowBuyModal(false); setBuyStep('details'); setError('') }}
                    className="flex-1 py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#8B8B9E' }}
                    disabled={buyStep !== 'details'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuy}
                    disabled={buyStep !== 'details' || (listing.delivery_type !== 'collection' && !deliveryAddress.trim())}
                    className="flex-1 py-3 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: buyStep === 'details' ? '#F7931A' : '#2A2A3A' }}
                  >
                    {buyStep === 'details' ? 'Confirm & Pay' : 'Processing...'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  )
}
