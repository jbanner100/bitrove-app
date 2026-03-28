// ── BITROVE TRADE DETAIL PAGE (app/trades/[id]/page.tsx) ───────
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { supabase } from '../../../lib/supabase'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../../lib/contract'
import { decryptAddress } from '../../../lib/encryption'
import XMTPChat from '../../components/XMTPChat'

const tokenConfig: Record<string, { symbol: string, color: string }> = {
  BTC:  { symbol: '₿', color: '#F7931A' },
  ETH:  { symbol: 'Ξ', color: '#8B8B9E' },
  USDT: { symbol: '◈', color: '#00D4AA' },
}

const statusConfig: Record<string, { label: string, color: string }> = {
  funded:   { label: 'In Escrow', color: '#F7931A' },
  complete: { label: 'Complete',  color: '#00D4AA' },
  disputed: { label: 'Disputed',  color: '#ff4444' },
  refunded: { label: 'Refunded',  color: '#8B8B9E' },
}

export default function TradeDetailPage() {
  const params = useParams()
  const { address } = useAccount()
  const [trade, setTrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  useEffect(() => {
    const fetchTrade = async () => {
      const { data } = await supabase
        .from('trades')
        .select('*, listings(*)')
        .eq('id', params.id)
        .single()
      if (data) setTrade(data)
      setLoading(false)
    }
    fetchTrade()
  }, [params.id])

  const handleConfirmReceipt = async () => {
    if (!trade?.trade_id_onchain) return
    setActionLoading(true)
    setError('')
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'confirmReceipt',
        args: [trade.trade_id_onchain as `0x${string}`],
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'complete' })
        .eq('id', trade.id)
      if (updateError) {
        console.error('Supabase update error:', updateError)
        setError('Trade confirmed on-chain but failed to update UI. Please refresh.')
      } else {
        setTrade({ ...trade, status: 'complete' })
        setSuccess('Payment released to seller. Trade complete!')
      }
    } catch (e: any) {
      console.error('Error:', e)
      setError(e.message || 'Transaction failed')
    }
    setActionLoading(false)
  }

  const handleRaiseDispute = async () => {
    if (!trade?.trade_id_onchain) return
    setActionLoading(true)
    setError('')
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'raiseDispute',
        args: [trade.trade_id_onchain as `0x${string}`],
      })
      await publicClient!.waitForTransactionReceipt({ hash })
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'disputed' })
        .eq('id', trade.id)
      if (updateError) {
        console.error('Supabase update error:', updateError)
        setError('Dispute raised on-chain but failed to update UI. Please refresh.')
      } else {
        setTrade({ ...trade, status: 'disputed' })
        setSuccess('Dispute raised. Bitrove will review within 48 hours.')
      }
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    }
    setActionLoading(false)
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
      <p style={{ color: '#8B8B9E' }}>Loading trade...</p>
    </main>
  )

  if (!trade) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
      <p className="text-white">Trade not found.</p>
    </main>
  )

  const token = tokenConfig[trade.token] || tokenConfig.BTC
  const status = statusConfig[trade.status] || statusConfig.funded
  const isBuyer = address?.toLowerCase() === trade.buyer_address?.toLowerCase()
  const isSeller = address?.toLowerCase() === trade.seller_address?.toLowerCase()

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>

      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
        </div>
        <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
      </nav>

      <div className="px-6 py-4 max-w-3xl mx-auto">
        <a href="/trades" className="text-sm" style={{ color: '#8B8B9E' }}>← Back to My Trades</a>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{trade.listings?.title || 'Trade'}</h1>
              <p className="text-xs" style={{ color: '#8B8B9E' }}>Trade ID: {trade.trade_id_onchain?.slice(0, 10)}...</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${status.color}22`, border: `1px solid ${status.color}`, color: status.color }}>
              {status.label}
            </span>
          </div>

          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
            <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Amount in escrow</p>
            <p className="text-2xl font-bold" style={{ color: token.color }}>{token.symbol} {trade.crypto_amount?.toFixed(6)}</p>
            <p className="text-xs mt-1" style={{ color: '#8B8B9E' }}>approx ${trade.aud_price?.toLocaleString()} AUD</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg p-3" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
              <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Buyer {isBuyer ? '(You)' : ''}</p>
              <p className="font-mono text-xs text-white">{trade.buyer_address?.slice(0, 6)}...{trade.buyer_address?.slice(-4)}</p>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
              <p className="text-xs mb-1" style={{ color: '#8B8B9E' }}>Seller {isSeller ? '(You)' : ''}</p>
              <p className="font-mono text-xs text-white">{trade.seller_address?.slice(0, 6)}...{trade.seller_address?.slice(-4)}</p>
            </div>
          </div>

          <p className="text-xs" style={{ color: '#8B8B9E' }}>Created: {new Date(trade.created_at).toLocaleString('en-AU')}</p>
        </div>

        {isSeller && trade.encrypted_address && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#00D4AA' }}>Delivery Address</p>
            <p className="text-sm text-white">{decryptAddress(trade.encrypted_address, trade.trade_id_onchain, trade.buyer_address, trade.seller_address)}</p>
            <p className="text-xs mt-2" style={{ color: '#8B8B9E' }}>Ship to this address and notify the buyer once dispatched.</p>
          </div>
        )}

        {success && (
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#00D4AA22', border: '1px solid #00D4AA' }}>
            <p className="text-sm" style={{ color: '#00D4AA' }}>✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#ff444422', border: '1px solid #ff4444' }}>
            <p className="text-sm" style={{ color: '#ff4444' }}>⚠ {error}</p>
          </div>
        )}

        {isBuyer && trade.status === 'funded' && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <h2 className="text-white font-semibold mb-2">Buyer Actions</h2>
            <p className="text-xs mb-6" style={{ color: '#8B8B9E' }}>Confirm receipt to release payment. Raise a dispute if there is a problem.</p>
            <div className="flex gap-3">
              <button onClick={handleConfirmReceipt} disabled={actionLoading} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#00D4AA' }}>
                {actionLoading ? 'Processing...' : 'Confirm Receipt'}
              </button>
              <button onClick={handleRaiseDispute} disabled={actionLoading} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: '#0A0A0F', border: '1px solid #ff4444', color: '#ff4444' }}>
                {actionLoading ? 'Processing...' : 'Raise Dispute'}
              </button>
            </div>
          </div>
        )}

        {isSeller && trade.status === 'funded' && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <h2 className="text-white font-semibold mb-2">Seller Instructions</h2>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
              <p className="text-xs" style={{ color: '#00D4AA' }}>Next steps:</p>
              <p className="text-xs mt-2" style={{ color: '#8B8B9E' }}>1. Ship the item to the delivery address above</p>
              <p className="text-xs mt-1" style={{ color: '#8B8B9E' }}>2. Buyer confirms receipt — payment released automatically</p>
              <p className="text-xs mt-1" style={{ color: '#8B8B9E' }}>3. If no action after 7 days — payment auto-releases to you</p>
            </div>
          </div>
        )}

        {trade.status === 'complete' && (
          <div className="rounded-xl p-6 mb-6 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #00D4AA' }}>
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-white font-semibold mb-2">Trade Complete!</p>
            <p className="text-sm" style={{ color: '#8B8B9E' }}>{isBuyer ? 'Payment released to seller.' : 'Payment released to your wallet.'}</p>
          </div>
        )}

        {trade.status === 'disputed' && (
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13131A', border: '1px solid #ff4444' }}>
            <p className="text-white font-semibold mb-2">Dispute In Progress</p>
            <p className="text-sm" style={{ color: '#8B8B9E' }}>Bitrove is reviewing this trade. We will resolve within 48 hours. Funds are frozen until resolution.</p>
          </div>
        )}

        {(isBuyer || isSeller) && (
          <XMTPChat
            recipientAddress={isBuyer ? trade.seller_address : trade.buyer_address}
            recipientLabel={isBuyer ? `Seller ${trade.seller_address?.slice(0,6)}...${trade.seller_address?.slice(-4)}` : `Buyer ${trade.buyer_address?.slice(0,6)}...${trade.buyer_address?.slice(-4)}`}
            listingTitle={trade.listings?.title}
            listingId={trade.listing_id}
            showDeleteButton={true}
          />
        )}

        <div className="text-center">
          <a href={`https://polygonscan.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: '#8B8B9E' }}>
            View contract on Polygonscan
          </a>
        </div>

      </div>
    </main>
  )
}
