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

function getMidnightWallet(): any {
  const w = window as any
  if (!w.midnight) return null
  // DApp Connector API v4 uses dynamic UUID keys, not 'mnLace'
  const keys = Object.keys(w.midnight)
  if (keys.length === 0) return null
  // Find Lace specifically, or fall back to first available wallet
  const laceKey = keys.find(k => w.midnight[k]?.name === 'lace') ?? keys[0]
  return w.midnight[laceKey] ?? null
}

export function useWallet(): WalletState {
  const { address: polygonAddress, isConnected: isPolygonConnected } = useAccount()

  const [midnightAddress, setMidnightAddress] = useState<string | null>(null)
  const [midnightCoinPublicKey, setMidnightCoinPublicKey] = useState<string | null>(null)
  const [isLaceAvailable, setIsLaceAvailable] = useState(false)

  useEffect(() => {
    const checkLace = () => {
      setIsLaceAvailable(!!getMidnightWallet())
    }
    checkLace()
    const timer = setTimeout(checkLace, 500)
    return () => clearTimeout(timer)
  }, [])

  const connectMidnight = async () => {
    try {
      const wallet = getMidnightWallet()
      if (!wallet) throw new Error('Lace Midnight wallet not found')

      // DApp Connector API v4 uses connect(networkId)
      const api = await wallet.connect('mainnet')
      console.log('Midnight API:', api)
      console.log('Midnight API keys:', Object.getOwnPropertyNames(api))
      
      setMidnightAddress('connected')  // temporary - log api first
      setMidnightCoinPublicKey(null)
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
