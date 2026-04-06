'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

export type Chain = 'polygon' | 'midnight'

export interface WalletState {
  isConnected: boolean
  chain: Chain | null
  polygonAddress: string | null
  midnightAddress: string | null
  midnightCoinPublicKey: string | null
  connectMidnight: () => Promise<void>
  disconnectMidnight: () => void
  isLaceAvailable: boolean
}

export function useWallet(): WalletState {
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()

  const [midnightAddress, setMidnightAddress] = useState<string | null>(null)
  const [midnightCoinPublicKey, setMidnightCoinPublicKey] = useState<string | null>(null)
  const [isLaceAvailable, setIsLaceAvailable] = useState(false)

  useEffect(() => {
    const checkLace = () => {
      const w = window as any
      setIsLaceAvailable(!!(w.midnight?.mnLace))
    }
    checkLace()
    const timer = setTimeout(checkLace, 500)
    return () => clearTimeout(timer)
  }, [])

  const connectMidnight = async () => {
    try {
      const w = window as any
      if (!w.midnight?.mnLace) throw new Error('Lace wallet not found')
      const api = await w.midnight.mnLace.connect('preview')
      const addresses = await api.getShieldedAddresses()
      const coinPublicKey = await api.getCoinPublicKey?.() ?? null
      setMidnightAddress(addresses[0] ?? null)
      setMidnightCoinPublicKey(coinPublicKey)
    } catch (err) {
      console.error('Midnight connect failed:', err)
    }
  }

  const disconnectMidnight = () => {
    setMidnightAddress(null)
    setMidnightCoinPublicKey(null)
  }

  const chain: Chain | null = midnightAddress ? 'midnight' : isPolygonConnected ? 'polygon' : null

  return {
    isConnected: !!midnightAddress || isPolygonConnected,
    chain,
    polygonAddress: polygonAddress ?? null,
    midnightAddress,
    midnightCoinPublicKey,
    connectMidnight,
    disconnectMidnight,
    isLaceAvailable,
  }
}
